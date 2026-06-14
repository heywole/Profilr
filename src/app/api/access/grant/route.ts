import { NextResponse }   from 'next/server'
import { shelby }         from '@/lib/shelby'
import { genLayer }       from '@/lib/genlayer'
import { getProfileBlobId, saveProfile, saveAccessRecord, incrementStat } from '@/lib/db'
import { v4 as uuid }     from 'uuid'
import type { ProfilrProfile, AccessRecord } from '@/types'

const ACCESS_DAYS = parseInt(process.env.NEXT_PUBLIC_ACCESS_DAYS ?? '7')

export async function POST(req: Request) {
  try {
    const { profileBlobId, profileId, viewerWallet, ownerWallet, amountUsdc, txHash } = await req.json()

    if (!profileBlobId || !viewerWallet || !ownerWallet || !txHash)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const now      = Date.now()
    const expiresAt = now + ACCESS_DAYS * 24 * 60 * 60 * 1000

    const record: AccessRecord & { ownerWallet: string; profileBlobId: string } = {
      id: uuid(), profileId: profileId ?? '', viewerWallet,
      paidAt: now, expiresAt, txHash,
      amountUsdc: Number(amountUsdc), isActive: true,
      ownerWallet, profileBlobId,
    }

    await saveAccessRecord(record)
    await incrementStat('total_payments')
    await incrementStat('total_platform_earnings', Number(amountUsdc) * 0.2)
    await shelby.uploadJson(record)

    // Update profile stats
    const storedBlobId = await getProfileBlobId(ownerWallet)
    if (storedBlobId) {
      try {
        const profile = await shelby.downloadJson<ProfilrProfile>(storedBlobId)
        profile.totalViews    = (profile.totalViews    ?? 0) + 1
        profile.totalEarnings = (profile.totalEarnings ?? 0) + Number(amountUsdc) * 0.7
        profile.updatedAt     = now
        const { blobId } = await shelby.uploadJson(profile)
        await saveProfile(ownerWallet, profile, blobId)
      } catch {}
    }

    try { await genLayer.lockAccess(profileBlobId, viewerWallet, Number(amountUsdc), ACCESS_DAYS) } catch {}

    return NextResponse.json({ record, expiresAt })
  } catch (e) {
    console.error('[access/grant]', e)
    return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 })
  }
}
