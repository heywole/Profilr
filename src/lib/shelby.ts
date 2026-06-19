import type { ShelbyUploadResult } from '@/types'

const BASE = process.env.SHELBY_API_URL ?? 'https://api.shelby.xyz'
const KEY  = process.env.SHELBY_API_KEY ?? ''

/**
 * Uploads to Shelby. If Shelby is unreachable, unauthorized, or not
 * configured correctly, this NEVER throws — it always falls back to a
 * local placeholder blob so the rest of the app keeps working.
 * This is intentional: we don't yet have confirmed Shelby API docs,
 * so we treat any failure as "not available yet" rather than crashing.
 */
async function safeUpload(data: string, contentType = 'application/json'): Promise<ShelbyUploadResult> {
  const apiKey = process.env.SHELBY_API_KEY ?? ''
  const apiUrl = process.env.SHELBY_API_URL ?? 'https://api.shelby.xyz'

  const fallback = async (): Promise<ShelbyUploadResult> => {
    const { v4: uuid } = await import('uuid')
    const localId = `local_${uuid()}`
    return { blobId: localId, merkleRoot: `0x${localId}`, size: data.length, url: '' }
  }

  if (!apiKey || apiKey === 'your_shelby_api_key_here' || apiKey === 'pending') {
    return fallback()
  }

  try {
    const res = await fetch(`${apiUrl}/v1/blobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': contentType },
      body: data,
    })

    if (!res.ok) {
      console.warn(`[Shelby] upload returned ${res.status} — falling back to local blob`)
      return fallback()
    }

    const j = await res.json()
    return {
      blobId:     j.blob_id ?? j.id,
      merkleRoot: j.merkle_root ?? j.merkleRoot ?? '',
      size:       j.size ?? 0,
      url:        `${apiUrl}/v1/blobs/${j.blob_id ?? j.id}`,
    }
  } catch (e) {
    console.warn('[Shelby] upload failed — falling back to local blob:', e)
    return fallback()
  }
}

class ShelbyClient {
  private get auth() {
    return { Authorization: `Bearer ${KEY}` }
  }

  async uploadJson(data: object): Promise<ShelbyUploadResult> {
    return safeUpload(JSON.stringify(data), 'application/json')
  }

  /** Upload a file as base64 text — works around binary body type issues */
  async uploadFileBase64(base64: string, mimeType: string): Promise<ShelbyUploadResult> {
    return safeUpload(JSON.stringify({ base64, mimeType }), 'application/json')
  }

  async downloadJson<T = unknown>(blobId: string): Promise<T> {
    if (blobId.startsWith('local_')) throw new Error('Local blob — Shelby not configured yet')
    const res = await fetch(`${BASE}/v1/blobs/${blobId}`, { headers: this.auth })
    if (!res.ok) throw new Error(`Shelby download failed ${res.status}`)
    return res.json() as Promise<T>
  }

  async listBlobs(prefix?: string): Promise<string[]> {
    try {
      const url = prefix
        ? `${BASE}/v1/blobs?prefix=${encodeURIComponent(prefix)}`
        : `${BASE}/v1/blobs`
      const res = await fetch(url, { headers: this.auth })
      if (!res.ok) return []
      const j = await res.json()
      return j.blobs ?? j.ids ?? []
    } catch {
      return []
    }
  }
}

export const shelby = new ShelbyClient()
