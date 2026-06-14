import { NextResponse }   from 'next/server'
import { shelby }         from '@/lib/shelby'
import { getAllProfileWallets, getProfileBlobId, getAllBanned, getAllFlagged } from '@/lib/db'
import type { ProfilrProfile } from '@/types'

function isAdmin(req: Request) {
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET ?? ''
  const wallet      = req.headers.get('x-admin-wallet') ?? ''
  return wallet.toLowerCase() === adminWallet.toLowerCase()
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [wallets, banned, flagged] = await Promise.all([
      getAllProfileWallets(), getAllBanned(), getAllFlagged(),
    ])

    const profiles: (ProfilrProfile & { isBanned: boolean; isFlagged: boolean; banReason?: string })[] = []

    await Promise.allSettled(wallets.map(async (wallet) => {
      try {
        const blobId = await getProfileBlobId(wallet)
        if (!blobId) return
        const p = await shelby.downloadJson<ProfilrProfile>(blobId)
        if (p?.walletAddress) {
          profiles.push({
            ...p,
            isBanned:  !!banned[wallet],
            isFlagged: !!flagged[wallet],
            banReason: banned[wallet] || flagged[wallet] || undefined,
          })
        }
      } catch {}
    }))

    profiles.sort((a, b) => b.createdAt - a.createdAt)
    return NextResponse.json({ profiles })
  } catch (e) {
    console.error('[admin/profiles]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
