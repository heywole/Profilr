import { NextResponse }       from 'next/server'
import { getAllAccessRecords } from '@/lib/db'

function isAdmin(req: Request) {
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET ?? ''
  const wallet      = req.headers.get('x-admin-wallet') ?? ''
  return wallet.toLowerCase() === adminWallet.toLowerCase()
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const records = await getAllAccessRecords(500)
    const now     = Date.now()
    return NextResponse.json({
      payments: records
        .map(r => ({
          ...r,
          isActive:    r.expiresAt > now,
          platformCut: +((r.amountUsdc ?? 0) * 0.2).toFixed(2),
        }))
        .sort((a, b) => b.paidAt - a.paidAt),
    })
  } catch (e) {
    console.error('[admin/payments]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
