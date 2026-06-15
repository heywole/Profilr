import type { ShelbyUploadResult } from '@/types'

const BASE = process.env.SHELBY_API_URL ?? 'https://api.shelby.xyz'
const KEY  = process.env.SHELBY_API_KEY ?? ''

class ShelbyClient {
  private auth = { Authorization: `Bearer ${KEY}` }

  async uploadJson(data: object): Promise<ShelbyUploadResult> {
    const body = JSON.stringify(data)
    return this.upload(body, 'application/json')
  }

  async upload(data: string | Uint8Array, contentType = 'application/octet-stream'): Promise<ShelbyUploadResult> {
    const apiKey = process.env.SHELBY_API_KEY ?? ''
    const apiUrl = process.env.SHELBY_API_URL ?? 'https://api.shelby.xyz'

    if (!apiKey || apiKey === 'your_shelby_api_key_here') {
      const { v4: uuid } = await import('uuid')
      const localId = `local_${uuid()}`
      return { blobId: localId, merkleRoot: `0x${localId}`, size: 0, url: '' }
    }

    const res = await fetch(`${apiUrl}/v1/blobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': contentType },
      body: typeof data === 'string' ? data : new Blob([data]),
    })
    if (!res.ok) throw new Error(`Shelby upload failed ${res.status}: ${await res.text()}`)
    const j = await res.json()
    return {
      blobId:     j.blob_id ?? j.id,
      merkleRoot: j.merkle_root ?? j.merkleRoot ?? '',
      size:       j.size ?? 0,
      url:        `${apiUrl}/v1/blobs/${j.blob_id ?? j.id}`,
    }
  }

  async downloadJson<T = unknown>(blobId: string): Promise<T> {
    if (blobId.startsWith('local_')) throw new Error('Local blob — no Shelby configured')
    const res = await fetch(`${BASE}/v1/blobs/${blobId}`, { headers: this.auth })
    if (!res.ok) throw new Error(`Shelby download failed ${res.status}`)
    return res.json() as Promise<T>
  }

  async downloadRaw(blobId: string): Promise<ArrayBuffer> {
    if (blobId.startsWith('local_')) throw new Error('Local blob — no Shelby configured')
    const res = await fetch(`${BASE}/v1/blobs/${blobId}`, { headers: this.auth })
    if (!res.ok) throw new Error(`Shelby download failed ${res.status}`)
    return res.arrayBuffer()
  }

  async listBlobs(prefix?: string): Promise<string[]> {
    const url = prefix
      ? `${BASE}/v1/blobs?prefix=${encodeURIComponent(prefix)}`
      : `${BASE}/v1/blobs`
    const res = await fetch(url, { headers: this.auth })
    if (!res.ok) throw new Error(`Shelby list failed ${res.status}`)
    const j = await res.json()
    return j.blobs ?? j.ids ?? []
  }
}

export const shelby = new ShelbyClient()
