import { NextResponse }    from 'next/server'
import { genLayer }        from '@/lib/genlayer'
import { getProfile, saveProfile } from '@/lib/db'
import type { Credential } from '@/types'

async function downloadFromShelby(blobId: string): Promise<Credential | null> {
  const apiKey = process.env.SHELBY_API_KEY
  const apiUrl = process.env.SHELBY_API_URL ?? 'https://api.shelby.xyz'

  if (!apiKey || apiKey === 'your_shelby_api_key_here') {
    return null
  }

  try {
    const res = await fetch(`${apiUrl}/v1/blobs/${blobId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { credentialId, blobId, walletAddress } = await req.json()

    if (!credentialId || !blobId)
      return NextResponse.json({ error: 'credentialId and blobId required' }, { status: 400 })

    // Submit to GenLayer for AI verification
    let txHash: unknown = null
    try {
      const credential = await downloadFromShelby(blobId)
      if (credential) {
        txHash = await genLayer.verifyCredential({
          credentialBlobId: blobId,
          type:             credential.type,
          title:            credential.title,
          institution:      credential.institution,
          ownerWallet:      walletAddress ?? '',
        })
      }
    } catch (e) {
      console.warn('[verify] GenLayer not configured:', e)
    }

    // Update credential status to reviewing in the profile
    if (walletAddress) {
      const profile = await getProfile(walletAddress)
      if (profile) {
        const idx = profile.credentials.findIndex(c => c.id === credentialId)
        if (idx >= 0) {
          profile.credentials[idx].verificationStatus = 'reviewing'
          profile.updatedAt = Date.now()

          // Upload updated profile
          const apiKey = process.env.SHELBY_API_KEY
          const apiUrl = process.env.SHELBY_API_URL ?? 'https://api.shelby.xyz'
          let newBlobId = profile.profileBlobId

          if (apiKey && apiKey !== 'your_shelby_api_key_here') {
            try {
              const res = await fetch(`${apiUrl}/v1/blobs`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
              })
              if (res.ok) {
                const j = await res.json()
                newBlobId = j.blob_id ?? j.id
              }
            } catch {}
          }

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
