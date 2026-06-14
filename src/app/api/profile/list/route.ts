import { NextResponse }          from 'next/server'
import { shelby }                from '@/lib/shelby'
import { getAllProfileWallets, getProfileBlobId, getAllBanned } from '@/lib/db'
import type { ProfilrProfile }   from '@/types'

export async function GET() {
  try {
    const wallets  = await getAllProfileWallets()
    const banned   = await getAllBanned()
    const profiles: ProfilrProfile[] = []

    await Promise.allSettled(
      wallets
        .filter(w => !banned[w])
        .map(async (wallet) => {
          try {
            const blobId = await getProfileBlobId(wallet)
            if (!blobId) return
            const p = await shelby.downloadJson<ProfilrProfile>(blobId)
            if (p?.walletAddress) profiles.push(p)
          } catch {}
        })
    )

    return NextResponse.json({ profiles })
  } catch {
    return NextResponse.json({ profiles: [] })
  }
}
