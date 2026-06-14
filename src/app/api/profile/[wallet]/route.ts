import { NextResponse }  from 'next/server'
import { shelby }        from '@/lib/shelby'
import { getProfileBlobId, isBanned } from '@/lib/db'
import type { ProfilrProfile } from '@/types'

export async function GET(_req: Request, { params }: { params: { wallet: string } }) {
  try {
    const { wallet } = params

    // Check if banned
    if (await isBanned(wallet))
      return NextResponse.json({ error: 'Profile unavailable' }, { status: 403 })

    const blobId = await getProfileBlobId(wallet)
    if (!blobId)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const profile = await shelby.downloadJson<ProfilrProfile>(blobId)
    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
}
