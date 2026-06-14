import { NextResponse }                                       from 'next/server'
import { banWallet, unbanWallet, flagWallet, unflagWallet, getAllBanned, getAllFlagged } from '@/lib/db'

function isAdmin(req: Request) {
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET ?? ''
  const wallet      = req.headers.get('x-admin-wallet') ?? ''
  return wallet.toLowerCase() === adminWallet.toLowerCase()
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { action, wallet, reason } = await req.json()
    if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 })

    switch (action) {
      case 'ban':    await banWallet(wallet,    reason ?? 'Banned by admin');   break
      case 'unban':  await unbanWallet(wallet);                                  break
      case 'flag':   await flagWallet(wallet,   reason ?? 'Flagged by admin');  break
      case 'unflag': await unflagWallet(wallet);                                 break
      default: return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, action, wallet })
  } catch (e) {
    console.error('[admin/ban]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [banned, flagged] = await Promise.all([getAllBanned(), getAllFlagged()])
    return NextResponse.json({ banned, flagged })
  } catch {
    return NextResponse.json({ banned: {}, flagged: {} })
  }
}
