import { NextResponse }      from 'next/server'
import { getPlatformStats, getAllProfileWallets, getAllCredentialIds, getAllAccessRecords } from '@/lib/db'

function isAdmin(req: Request) {
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET ?? ''
  const wallet      = req.headers.get('x-admin-wallet') ?? ''
  return wallet.toLowerCase() === adminWallet.toLowerCase()
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [stats, wallets, credIds, payments] = await Promise.all([
      getPlatformStats(),
      getAllProfileWallets(),
      getAllCredentialIds(),
      getAllAccessRecords(1000),
    ])
    const now            = Date.now()
    const totalRevenue   = payments.reduce((s, r) => s + (r.amountUsdc ?? 0) * 0.2, 0)
    return NextResponse.json({
      totalProfiles:    wallets.length,
      totalCredentials: credIds.length,
      totalPayments:    payments.length,
      platformEarnings: +totalRevenue.toFixed(2),
      activeAccess:     payments.filter(r => r.expiresAt > now).length,
      ...stats,
    })
  } catch (e) {
    console.error('[admin/stats]', e)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
