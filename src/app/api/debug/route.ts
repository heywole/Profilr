import { NextResponse } from 'next/server'

export async function GET() {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  const result: Record<string, unknown> = {
    hasUrl:      !!url,
    hasToken:    !!token,
    urlPrefix:   url   ? url.slice(0, 35)   + '…' : 'NOT SET',
    tokenPrefix: token ? token.slice(0, 12) + '…' : 'NOT SET',
    shelbyKey:   process.env.SHELBY_API_KEY   ? 'SET' : 'NOT SET',
    shelbyUrl:   process.env.SHELBY_API_URL   ?? 'NOT SET',
    genlayerCA:  process.env.GENLAYER_CONTRACT_ADDRESS ?? 'NOT SET',
  }

  if (url && token) {
    try {
      const { Redis } = await import('@upstash/redis')
      const r = new Redis({ url, token })
      await r.set('profilr:ping', Date.now().toString())
      const val = await r.get('profilr:ping')
      result.redisWorking = !!val
      result.redisMessage = 'Connected and read/write working'
    } catch (e) {
      result.redisWorking = false
      result.redisMessage = e instanceof Error ? e.message : String(e)
    }
  } else {
    result.redisWorking = false
    result.redisMessage = 'Env vars missing'
  }

  return NextResponse.json(result, { status: 200 })
}
