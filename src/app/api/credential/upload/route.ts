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
      id:                 uuid(),
      type:               type ?? 'education',
      title:              title.trim(),
      institution:        institution.trim(),
      description:        (description ?? '').trim(),
      startDate:          startDate ?? '',
      endDate:            endDate ?? '',
      current:            !!current,
      credentialUrl:      credentialUrl ?? '',
      blobId:             '',
      merkleRoot:         '',
      verificationStatus: 'pending',
      createdAt:          Date.now(),
    }

    const { blobId, merkleRoot } = await shelby.uploadJson(credential)
    credential.blobId     = blobId
    credential.merkleRoot = merkleRoot

    await saveCredential({ ...credential, ownerWallet: walletAddress })
    await incrementStat('total_credentials')

    // Get existing profile — or create a minimal one so credentials always attach
    let profile = await getProfile(walletAddress)

    if (!profile) {
      // Auto-create a minimal profile so credentials are always visible
      profile = {
        id:            uuid(),
        walletAddress,
        displayName:   walletAddress.slice(0, 8) + '…' + walletAddress.slice(-4),
        title:         '',
        bio:           '',
        location:      '',
        website:       '',
        accessMode:    'free',
        accessFeeUsdc: 2,
        profileBlobId: '',
        totalViews:    0,
        totalEarnings: 0,
        credentials:   [],
        createdAt:     Date.now(),
        updatedAt:     Date.now(),
      }
      await incrementStat('total_profiles')
    }

    profile.credentials.push(credential)
    profile.updatedAt = Date.now()

    const { blobId: newBlobId } = await shelby.uploadJson(profile)
    profile.profileBlobId = newBlobId
    await saveProfile(walletAddress, profile, newBlobId)

    return NextResponse.json({ credential })
  } catch (e) {
    console.error('[credential/upload]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to upload credential' },
      { status: 500 }
    )
  }
}
