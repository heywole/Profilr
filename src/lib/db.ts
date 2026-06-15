import type { ProfilrProfile, Credential, AccessRecord } from '@/types'

// ── Safe Redis with in-memory fallback when Upstash not configured ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redis: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRedis(): Promise<any> {
  if (redis) return redis
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token && url !== 'your_upstash_redis_url_here') {
    const { Redis } = await import('@upstash/redis')
    redis = new Redis({ url, token })
    return redis
  }
  return null
}

// ── In-memory fallback ──
const mem = {
  profiles:    new Map<string, string>(),
  profileData: new Map<string, ProfilrProfile>(),
  credentials: new Map<string, Credential & { ownerWallet: string }>(),
  access:      new Map<string, Array<AccessRecord & { ownerWallet: string; profileBlobId: string }>>(),
  accessAll:   [] as Array<AccessRecord & { ownerWallet?: string; profileBlobId?: string }>,
  banned:      new Map<string, string>(),
  flagged:     new Map<string, string>(),
  stats:       new Map<string, number>(),
}

// ── Profiles ──
export async function saveProfile(wallet: string, profile: ProfilrProfile, blobId: string) {
  mem.profiles.set(wallet, blobId)
  mem.profileData.set(wallet, profile)
  const r = await getRedis()
  if (r) {
    await r.set(`profile:blobid:${wallet}`, blobId)
    await r.set(`profile:${wallet}`, JSON.stringify(profile))
    await r.sadd('profiles:all', wallet)
  }
}

export async function getProfileBlobId(wallet: string): Promise<string | null> {
  if (mem.profiles.has(wallet)) return mem.profiles.get(wallet)!
  const r = await getRedis()
  if (r) {
    const id = await r.get(`profile:blobid:${wallet}`) as string | null
    if (id) mem.profiles.set(wallet, id)
    return id
  }
  return null
}

export async function getProfile(wallet: string): Promise<ProfilrProfile | null> {
  if (mem.profileData.has(wallet)) return mem.profileData.get(wallet)!
  const r = await getRedis()
  if (r) {
    const raw = await r.get(`profile:${wallet}`) as string | null
    if (!raw) return null
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw as ProfilrProfile
    mem.profileData.set(wallet, p)
    return p
  }
  return null
}

export async function getAllProfileWallets(): Promise<string[]> {
  const r = await getRedis()
  if (r) return r.smembers('profiles:all') as Promise<string[]>
  return Array.from(mem.profiles.keys())
}

// ── Credentials ──
export async function saveCredential(credential: Credential & { ownerWallet: string }) {
  mem.credentials.set(credential.id, credential)
  const r = await getRedis()
  if (r) {
    await r.set(`credential:${credential.id}`, JSON.stringify(credential))
    await r.sadd('credentials:all', credential.id)
  }
}

export async function getCredential(id: string): Promise<(Credential & { ownerWallet: string }) | null> {
  if (mem.credentials.has(id)) return mem.credentials.get(id)!
  const r = await getRedis()
  if (r) {
    const raw = await r.get(`credential:${id}`) as string | null
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  }
  return null
}

export async function getAllCredentialIds(): Promise<string[]> {
  const r = await getRedis()
  if (r) return r.smembers('credentials:all') as Promise<string[]>
  return Array.from(mem.credentials.keys())
}

// ── Access records ──
export async function saveAccessRecord(record: AccessRecord & { ownerWallet: string; profileBlobId: string }) {
  const ownerList = mem.access.get(record.ownerWallet) ?? []
  ownerList.push(record)
  mem.access.set(record.ownerWallet, ownerList)
  mem.accessAll.push(record)
  const r = await getRedis()
  if (r) {
    await r.lpush(`access:owner:${record.ownerWallet}`, JSON.stringify(record))
    await r.lpush('access:all', JSON.stringify(record))
  }
}

export async function getAccessRecordsByOwner(ownerWallet: string): Promise<AccessRecord[]> {
  const r = await getRedis()
  if (r) {
    const raw = await r.lrange(`access:owner:${ownerWallet}`, 0, 99) as string[]
    return raw.map(x => typeof x === 'string' ? JSON.parse(x) : x)
  }
  return mem.access.get(ownerWallet) ?? []
}

export async function getAllAccessRecords(limit = 100): Promise<(AccessRecord & { ownerWallet?: string })[]> {
  const r = await getRedis()
  if (r) {
    const raw = await r.lrange('access:all', 0, limit - 1) as string[]
    return raw.map(x => typeof x === 'string' ? JSON.parse(x) : x)
  }
  return mem.accessAll.slice(0, limit)
}

export async function checkActiveAccess(profileBlobId: string, viewerWallet: string): Promise<{
  hasAccess: boolean
  expiresAt: number | null
}> {
  const now = Date.now()
  for (const records of Array.from(mem.access.values())) {
    const found = records.find(
      r => r.viewerWallet === viewerWallet && r.profileBlobId === profileBlobId && r.expiresAt > now
    )
    if (found) return { hasAccess: true, expiresAt: found.expiresAt }
  }
  const r = await getRedis()
  if (r) {
    const keys = await r.keys('access:owner:*') as string[]
    for (const key of keys) {
      const raw = await r.lrange(key, 0, 99) as string[]
      for (const item of raw) {
        const rec = typeof item === 'string' ? JSON.parse(item) : item
        if (
          rec.viewerWallet  === viewerWallet &&
          rec.profileBlobId === profileBlobId &&
          rec.expiresAt > now
        ) {
          return { hasAccess: true, expiresAt: rec.expiresAt }
        }
      }
    }
  }
  return { hasAccess: false, expiresAt: null }
}

// ── Admin ──
export async function banWallet(wallet: string, reason: string) {
  mem.banned.set(wallet, reason)
  const r = await getRedis()
  if (r) await r.hset('admin:banned', { [wallet]: reason })
}
export async function unbanWallet(wallet: string) {
  mem.banned.delete(wallet)
  const r = await getRedis()
  if (r) await r.hdel('admin:banned', wallet)
}
export async function isBanned(wallet: string): Promise<boolean> {
  if (mem.banned.has(wallet)) return true
  const r = await getRedis()
  if (r) return !!(await r.hget('admin:banned', wallet))
  return false
}
export async function getAllBanned(): Promise<Record<string, string>> {
  const r = await getRedis()
  if (r) return ((await r.hgetall('admin:banned')) ?? {}) as Record<string, string>
  return Object.fromEntries(mem.banned)
}
export async function flagWallet(wallet: string, reason: string) {
  mem.flagged.set(wallet, reason)
  const r = await getRedis()
  if (r) await r.hset('admin:flagged', { [wallet]: reason })
}
export async function unflagWallet(wallet: string) {
  mem.flagged.delete(wallet)
  const r = await getRedis()
  if (r) await r.hdel('admin:flagged', wallet)
}
export async function getAllFlagged(): Promise<Record<string, string>> {
  const r = await getRedis()
  if (r) return ((await r.hgetall('admin:flagged')) ?? {}) as Record<string, string>
  return Object.fromEntries(mem.flagged)
}
export async function incrementStat(field: string, amount = 1) {
  mem.stats.set(field, (mem.stats.get(field) ?? 0) + amount)
  const r = await getRedis()
  if (r) await r.hincrbyfloat('admin:stats', field, amount)
}
export async function getPlatformStats(): Promise<Record<string, number>> {
  const r = await getRedis()
  if (r) {
    const raw = (await r.hgetall('admin:stats')) as Record<string, string> | null
    if (raw) return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, parseFloat(v) || 0])
    )
  }
  return Object.fromEntries(mem.stats)
}
