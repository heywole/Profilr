import type { ShelbyUploadResult } from '@/types'

const BASE = process.env.SHELBY_API_URL   ?? 'https://api.shelby.xyz'
const KEY  = process.env.SHELBY_API_KEY   ?? ''

class ShelbyClient {
  private auth = { Authorization: `Bearer ${KEY}` }

  async uploadJson(data: object): Promise<ShelbyUploadResult> {
    const buf = Buffer.from(JSON.stringify(data))
    return this.upload(buf, 'application/json')
  }

  async upload(data: Buffer | Uint8Array, contentType = 'application/octet-stream'): Promise<ShelbyUploadResult> {
    const res = await fetch(`${BASE}/v1/blobs`, {
      method: 'POST',
      headers: { ...this.auth, 'Content-Type': contentType },
      body: data,
    })
    if (!res.ok) throw new Error(`Shelby upload failed ${res.status}: ${await res.text()}`)
    const j = await res.json()
    return {
      blobId:     j.blob_id ?? j.id,
      merkleRoot: j.merkle_root ?? j.merkleRoot ?? '',
      size:       j.size ?? data.byteLength,
      url:        `${BASE}/v1/blobs/${j.blob_id ?? j.id}`,
    }
  }

  async downloadJson<T = unknown>(blobId: string): Promise<T> {
    const res = await fetch(`${BASE}/v1/blobs/${blobId}`, { headers: this.auth })
    if (!res.ok) throw new Error(`Shelby download failed ${res.status}`)
    return res.json() as Promise<T>
  }

  async downloadRaw(blobId: string): Promise<ArrayBuffer> {
    const res = await fetch(`${BASE}/v1/blobs/${blobId}`, { headers: this.auth })
    if (!res.ok) throw new Error(`Shelby download failed ${res.status}`)
    return res.arrayBuffer()
  }
}

export const shelby = new ShelbyClient()
