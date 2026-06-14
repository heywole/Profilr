import { NextResponse }  from 'next/server'
import { saveProfile, getProfileBlobId, getProfile } from '@/lib/db'
import { v4 as uuid }    from 'uuid'
import type { ProfilrProfile } from '@/types'

// Shelby upload with graceful fallback when API key not configured
async function uploadToShelby(data: object): Promise<{ blobId: string; merkleRoot: string }> {
  const apiKey = process.env.SHELBY_API_KEY
  const apiUrl = process.env.SHELBY_API_URL ?? 'https://api.shelby.xyz'

  if (!apiKey || apiKey === 'your_shelby_api_key_here') {
    // No Shelby configured — generate a local ID for development
    const localId = `local_${uuid()}`
    console.warn('[Shelby] API key not set — using local blob ID:', localId)
    return { blobId: localId, merkleRoot: `0x${localId}` }
  }

  const res = await fetch(`${apiUrl}/v1/blobs`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Shelby upload failed: ${res.status}`)
  const j = await res.json()
  return { blobId: j.blob_id ?? j.id, merkleRoot: j.merkle_root ?? '' }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { walletAddress, displayName, title, bio, location, website, accessMode, accessFeeUsdc } = body

    if (!walletAddress || !displayName) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })
    }

    // Load existing profile to preserve credentials and stats
    let existing: ProfilrProfile | null = await getProfile(walletAddress)

    const profile: ProfilrProfile = {
      id:            existing?.id            ?? uuid(),
      walletAddress,
      displayName:   displayName.trim(),
      title:         (title ?? '').trim(),
      bio:           (bio ?? '').trim(),
      location:      (location ?? '').trim(),
      website:       (website ?? '').trim(),
      accessMode:    accessMode    ?? 'free',
      accessFeeUsdc: Number(accessFeeUsdc) || 2,
      profileBlobId: existing?.profileBlobId ?? '',
      totalViews:    existing?.totalViews    ?? 0,
      totalEarnings: existing?.totalEarnings ?? 0,
      credentials:   existing?.credentials  ?? [],
      createdAt:     existing?.createdAt     ?? Date.now(),
      updatedAt:     Date.now(),
    }

    // Upload to Shelby (with fallback)
    const { blobId } = await uploadToShelby(profile)
    profile.profileBlobId = blobId

    // Persist to Redis
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
