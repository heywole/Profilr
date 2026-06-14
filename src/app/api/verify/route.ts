import { NextResponse }    from 'next/server'
import { shelby }          from '@/lib/shelby'
import { genLayer }        from '@/lib/genlayer'
import { profileRegistry } from '../profile/save/route'
import type { ProfilrProfile, Credential } from '@/types'

export async function POST(req: Request) {
  try {
    const { credentialId, blobId, walletAddress } = await req.json()

    if (!credentialId || !blobId)
      return NextResponse.json({ error: 'credentialId and blobId required' }, { status: 400 })

    // Fetch credential from Shelby
    const credential = await shelby.downloadJson<Credential>(blobId)

    // Submit to GenLayer for AI verification
    const txHash = await genLayer.verifyCredential({
      credentialBlobId: blobId,
      type:             credential.type,
      title:            credential.title,
      institution:      credential.institution,
      ownerWallet:      walletAddress ?? '',
    })

    // Update credential status to 'reviewing'
    credential.verificationStatus = 'reviewing'
    const { blobId: newBlobId } = await shelby.uploadJson(credential)

    // Update profile
    if (walletAddress) {
      const profileBlobId = profileRegistry.get(walletAddress)
      if (profileBlobId) {
        const profile = await shelby.downloadJson<ProfilrProfile>(profileBlobId)
        const idx = profile.credentials.findIndex(c => c.id === credentialId)
        if (idx >= 0) {
          profile.credentials[idx].verificationStatus = 'reviewing'
          profile.credentials[idx].blobId = newBlobId
          const { blobId: newProfileBlobId } = await shelby.uploadJson(profile)
          profileRegistry.set(walletAddress, newProfileBlobId)
        }
      }
    }

    return NextResponse.json({ status: 'submitted', txHash })
  } catch (e) {
    console.error('[verify]', e)
    return NextResponse.json({ error: 'Failed to submit for verification' }, { status: 500 })
  }
}

// Poll for verdict (called by frontend or cron)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const blobId = searchParams.get('blobId')
    if (!blobId) return NextResponse.json({ error: 'blobId required' }, { status: 400 })

    const verdict = await genLayer.getVerdict(blobId)
    return NextResponse.json({ verdict })
  } catch {
    return NextResponse.json({ verdict: null })
  }
}
