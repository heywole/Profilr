import { NextResponse }      from 'next/server'
import { checkActiveAccess } from '@/lib/db'
import { genLayer }          from '@/lib/genlayer'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const profileBlobId    = searchParams.get('profileBlobId')
    const viewer           = searchParams.get('viewer')
    if (!profileBlobId || !viewer) return NextResponse.json({ hasAccess: false, expiresAt: null })

    // Check GenLayer first
    const glResult = await genLayer.checkAccess(profileBlobId, viewer)
    if (glResult.hasAccess) return NextResponse.json(glResult)

    // Fallback to Redis
    const result = await checkActiveAccess(profileBlobId, viewer)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ hasAccess: false, expiresAt: null })
  }
}
