import { NextResponse }    from 'next/server'
import { genLayer }        from '@/lib/genlayer'
import { getProfile, saveProfile, getCredential, saveCredential } from '@/lib/db'
import { shelby }          from '@/lib/shelby'
import type { Credential } from '@/types'

export async function POST(req: Request) {
  try {
    const { credentialId, blobId, walletAddress } = await req.json()

    if (!credentialId || !blobId)
      return NextResponse.json({ error: 'credentialId and blobId required' }, { status: 400 })

    // Submit to GenLayer
    let txHash: string | null = null
    try {
      const cred = await getCredential(credentialId)
      if (cred) {
        txHash = await genLayer.verifyCredential({
          credentialBlobId: blobId,
          type:             cred.type,
          title:            cred.title,
          institution:      cred.institution,
          ownerWallet:      walletAddress ?? cred.ownerWallet ?? '',
        }) as string
      }
    } catch (e) {
      console.warn('[verify] GenLayer call failed:', e)
    }

    // Update credential status to 'reviewing' + store tx hash
    const updateCredential = async (c: Credential & { ownerWallet: string }) => {
      c.verificationStatus = 'reviewing'
      if (txHash) c.verificationBlobId = txHash
      await saveCredential(c)
    }

    const existingCred = await getCredential(credentialId)
    if (existingCred) await updateCredential(existingCred)

    // Update inside profile credentials array
    if (walletAddress) {
      const profile = await getProfile(walletAddress)
      if (profile) {
        const idx = profile.credentials.findIndex(c => c.id === credentialId)
        if (idx >= 0) {
          profile.credentials[idx].verificationStatus = 'reviewing'
          if (txHash) profile.credentials[idx].verificationBlobId = txHash
          profile.updatedAt = Date.now()
          const { blobId: newBlobId } = await shelby.uploadJson(profile)
          await saveProfile(walletAddress, profile, newBlobId)
        }
      }
    }

    return NextResponse.json({ status: 'submitted', txHash })
  } catch (e) {
    console.error('[verify]', e)
    return NextResponse.json({ error: 'Failed to submit for verification' }, { status: 500 })
  }
}

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
