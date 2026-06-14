import { NextResponse }        from 'next/server'
import { getProfile, saveProfile, saveCredential, incrementStat } from '@/lib/db'
import { v4 as uuid }          from 'uuid'
import type { ProfilrProfile, Credential } from '@/types'

async function uploadToShelby(data: object): Promise<{ blobId: string; merkleRoot: string }> {
  const apiKey = process.env.SHELBY_API_KEY
  const apiUrl = process.env.SHELBY_API_URL ?? 'https://api.shelby.xyz'

  if (!apiKey || apiKey === 'your_shelby_api_key_here') {
    const localId = `local_${uuid()}`
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
    const { walletAddress, type, title, institution, description, startDate, endDate, current, credentialUrl } = body

    if (!walletAddress || !title || !institution) {
      return NextResponse.json({ error: 'Title and institution are required' }, { status: 400 })
    }

    const credential: Credential = {
      id: uuid(),
      type: type ?? 'education',
      title: title.trim(),
      institution: institution.trim(),
      description: (description ?? '').trim(),
      startDate: startDate ?? '',
      endDate: endDate ?? '',
      current: !!current,
      credentialUrl: credentialUrl ?? '',
      blobId: '',
      merkleRoot: '',
      verificationStatus: 'pending',
      createdAt: Date.now(),
    }

    const { blobId, merkleRoot } = await uploadToShelby(credential)
    credential.blobId     = blobId
    credential.merkleRoot = merkleRoot

    await saveCredential({ ...credential, ownerWallet: walletAddress })
    await incrementStat('total_credentials')

    // Attach to profile
    const profile = await getProfile(walletAddress)
    if (profile) {
      profile.credentials.push(credential)
      profile.updatedAt = Date.now()
      const { blobId: newBlobId } = await uploadToShelby(profile)
      await saveProfile(walletAddress, profile, newBlobId)
    }

    return NextResponse.json({ credential })
  } catch (e) {
    console.error('[credential/upload]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to upload credential' },
      { status: 500 }
    )
  }
}
