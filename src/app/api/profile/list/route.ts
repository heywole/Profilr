import { NextResponse }          from 'next/server'
import { getAllProfileWallets, getProfile, getAllBanned } from '@/lib/db'
import type { ProfilrProfile }   from '@/types'

export async function GET() {
  try {
    const [wallets, banned] = await Promise.all([getAllProfileWallets(), getAllBanned()])
    const profiles: ProfilrProfile[] = []

    await Promise.allSettled(
      wallets.filter(w => !banned[w]).map(async (wallet) => {
        const p = await getProfile(wallet)
        if (p?.walletAddress) profiles.push(p)
      })
    )

    return NextResponse.json({ profiles })
  } catch {
    return NextResponse.json({ profiles: [] })
  }
}
