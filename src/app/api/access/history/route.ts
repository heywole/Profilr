import { NextResponse }          from 'next/server'
import { getAccessRecordsByOwner } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')
    if (!wallet) return NextResponse.json({ records: [] })
    const records = await getAccessRecordsByOwner(wallet)
    const now = Date.now()
    return NextResponse.json({
      records: records
        .map(r => ({ ...r, isActive: r.expiresAt > now }))
        .sort((a, b) => b.paidAt - a.paidAt)
    })
  } catch {
    return NextResponse.json({ records: [] })
  }
}
