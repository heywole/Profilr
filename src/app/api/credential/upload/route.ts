import { NextResponse }        from 'next/server'
import { shelby }              from '@/lib/shelby'
import { getProfile, saveProfile, saveCredential, incrementStat } from '@/lib/db'
import { v4 as uuid }          from 'uuid'
import type { ProfilrProfile, Credential } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { walletAddress, type, title, institution, description, startDate, endDate, current, credentialUrl } = body

    if (!walletAddress || !title || !institution)
      return NextResponse.json({ error: 'Title and institution are required' }, { status: 400 })

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

    const { blobId, merkleRoot } = await shelby.uploadJson(credential)
    credential.blobId     = blobId
    credential.merkleRoot = merkleRoot

    await saveCredential({ ...credential, ownerWallet: walletAddress })
    await incrementStat('total_credentials')

    const profile = await getProfile(walletAddress)
    if (profile) {
      profile.credentials.push(credential)
      profile.updatedAt = Date.now()
      const { blobId: newBlobId } = await shelby.uploadJson(profile)
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
