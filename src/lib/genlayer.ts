const RPC      = process.env.GENLAYER_RPC_URL            ?? 'https://studio.genlayer.com/api'
const CONTRACT = process.env.GENLAYER_CONTRACT_ADDRESS   ?? ''

class GenLayerClient {
  private async rpc(method: string, params: unknown[]) {
    const res = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    })
    const j = await res.json() as { result?: unknown; error?: { message: string } }
    if (j.error) throw new Error(`GenLayer: ${j.error.message}`)
    return j.result
  }

  async verifyCredential(params: {
    credentialBlobId: string
    type: string
    title: string
    institution: string
    ownerWallet: string
  }) {
    return this.rpc('gen_sendTransaction', [{
      to: CONTRACT,
      data: { method: 'verify_credential', args: [
        params.credentialBlobId, params.type,
        params.title, params.institution, params.ownerWallet,
      ]},
    }])
  }

  async getVerdict(credentialBlobId: string) {
    try {
      const r = await this.rpc('gen_call', [{ to: CONTRACT, data: { method: 'get_verdict', args: [credentialBlobId] } }]) as Record<string,unknown>
      if (!r) return null
      return { verdict: r.verdict as string, reasoning: r.reasoning as string, timestamp: r.timestamp as number }
    } catch { return null }
  }

  async checkAccess(profileBlobId: string, viewer: string) {
    try {
      const r = await this.rpc('gen_call', [{ to: CONTRACT, data: { method: 'check_access', args: [profileBlobId, viewer] } }]) as Record<string,unknown>
      return { hasAccess: !!r?.has_access, expiresAt: (r?.expires_at as number) ?? null }
    } catch { return { hasAccess: false, expiresAt: null } }
  }

  async lockAccess(profileBlobId: string, buyer: string, amount: number, days: number) {
    return this.rpc('gen_sendTransaction', [{
      to: CONTRACT,
      data: { method: 'lock_access', args: [profileBlobId, buyer, amount.toString(), days] },
    }])
  }
}

export const genLayer = new GenLayerClient()
