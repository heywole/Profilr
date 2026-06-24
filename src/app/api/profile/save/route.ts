import { NextResponse }  from 'next/server'
import { shelby }        from '@/lib/shelby'
import { saveProfile, getProfile } from '@/lib/db'
import { v4 as uuid }    from 'uuid'
import type { ProfilrProfile } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { walletAddress, displayName, title, bio, location, website, accessMode, accessFeeUsdc } = body

    if (!walletAddress || !displayName)
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })

    const existing = await getProfile(walletAddress)

    const profile: ProfilrProfile = {
      id:            existing?.id            ?? uuid(),
      walletAddress,
      displayName:   displayName.trim(),
      title:         (title    ?? '').trim(),
      bio:           (bio      ?? '').trim(),
      location:      (location ?? '').trim(),
      website:       (website  ?? '').trim(),
      accessMode:    accessMode    ?? 'free',
      accessFeeUsdc: Number(accessFeeUsdc) || 2,
      profileBlobId: existing?.profileBlobId ?? '',
      totalViews:    existing?.totalViews    ?? 0,
      totalEarnings: existing?.totalEarnings ?? 0,
      credentials:   existing?.credentials  ?? [],
      createdAt:     existing?.createdAt     ?? Date.now(),
      updatedAt:     Date.now(),
    }

    const { blobId } = await shelby.uploadJson(profile)
    profile.profileBlobId = blobId
    await saveProfile(walletAddress, profile, blobId)

    return NextResponse.json({ profile })
  } catch (e) {
    console.error('[profile/save]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to save profile' },
      { status: 500 }
    )
  }
}
