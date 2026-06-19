import { NextResponse }  from 'next/server'
import { shelby }        from '@/lib/shelby'
import { getProfile, saveProfile, getCredential, saveCredential } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file          = formData.get('file') as File | null
    const credentialId  = formData.get('credentialId') as string | null
    const walletAddress = formData.get('walletAddress') as string | null

    if (!file || !credentialId || !walletAddress)
      return NextResponse.json({ error: 'file, credentialId and walletAddress are required' }, { status: 400 })

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'File too large — max 5MB' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const base64       = Buffer.from(arrayBuffer).toString('base64')

    // Upload the file as a base64-encoded blob — works around binary body issues
    const { blobId } = await shelby.uploadFileBase64(base64, file.type || 'application/octet-stream')

    // Attach the file reference to the credential
    const existingCred = await getCredential(credentialId)
    if (existingCred) {
      existingCred.fileBlobId = blobId
      existingCred.fileName   = file.name
      existingCred.fileType   = file.type
      existingCred.fileSize   = file.size
      await saveCredential(existingCred)
    }

    // Update the credential inside the profile's credentials array too
    const profile = await getProfile(walletAddress)
    if (profile) {
      const idx = profile.credentials.findIndex(c => c.id === credentialId)
      if (idx >= 0) {
        profile.credentials[idx].fileBlobId = blobId
        profile.credentials[idx].fileName   = file.name
        profile.credentials[idx].fileType   = file.type
        profile.credentials[idx].fileSize   = file.size
        profile.updatedAt = Date.now()
        const { blobId: newProfileBlobId } = await shelby.uploadJson(profile)
        await saveProfile(walletAddress, profile, newProfileBlobId)
      }
    }

    return NextResponse.json({ fileBlobId: blobId, fileName: file.name })
  } catch (e) {
    console.error('[credential/upload-file]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}
