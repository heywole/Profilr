import { NextResponse }  from 'next/server'
import { getProfile, isBanned } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { wallet: string } }) {
  try {
    const { wallet } = params

    if (await isBanned(wallet))
      return NextResponse.json({ error: 'Profile unavailable' }, { status: 403 })

    // Read from our own database (Redis or memory) — NOT from Shelby directly.
    // Shelby is only the source of truth once it's actually connected;
    // until then, db.ts is what the app reads from for speed and reliability.
    const profile = await getProfile(wallet)

    if (!profile)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    return NextResponse.json({ profile })
  } catch (e) {
    console.error('[profile/[wallet]]', e)
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
}
