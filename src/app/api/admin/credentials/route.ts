import { NextResponse }   from 'next/server'
import { getAllCredentialIds, getCredential } from '@/lib/db'
import type { Credential } from '@/types'

function isAdmin(req: Request) {
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET ?? ''
  const wallet      = req.headers.get('x-admin-wallet') ?? ''
  return wallet.toLowerCase() === adminWallet.toLowerCase()
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const ids         = await getAllCredentialIds()
    const credentials: (Credential & { ownerWallet: string })[] = []

    await Promise.allSettled(ids.map(async (id) => {
      const c = await getCredential(id)
      if (c) credentials.push(c)
    }))

    credentials.sort((a, b) => b.createdAt - a.createdAt)
    return NextResponse.json({ credentials })
  } catch (e) {
    console.error('[admin/credentials]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
