import { NextResponse } from 'next/server'
import { getCredential, deleteCredential, getProfile, saveProfile } from '@/lib/db'
import { shelby } from '@/lib/shelby'

function isAdmin(req: Request) {
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET ?? ''
  const wallet = req.headers.get('x-admin-wallet') ?? ''
  return wallet.toLowerCase() === adminWallet.toLowerCase()
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { credentialId } = await req.json()
    if (!credentialId) return NextResponse.json({ error: 'credentialId required' }, { status: 400 })

    const cred = await getCredential(credentialId)
    if (!cred) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await deleteCredential(credentialId)

    const profile = await getProfile(cred.ownerWallet)
    if (profile) {
      profile.credentials = profile.credentials.filter(c => c.id !== credentialId)
      profile.updatedAt = Date.now()
      const { blobId } = await shelby.uploadJson(profile)
      await saveProfile(cred.ownerWallet, profile, blobId)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[admin/credential/delete]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
