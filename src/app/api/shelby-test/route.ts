import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.SHELBY_API_KEY ?? ''
  const apiUrl = process.env.SHELBY_API_URL ?? 'https://api.shelbynet.shelby.xyz'

  const testData = JSON.stringify({ test: true, timestamp: Date.now(), project: 'profilr' })

  const results: Record<string, unknown> = {
    apiUrl,
    hasKey: !!apiKey,
    keyPrefix: apiKey.slice(0, 15) + '…',
  }

  // Try endpoint 1: /v1/blobs
  try {
    const r1 = await fetch(`${apiUrl}/v1/blobs`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: testData,
    })
    results.endpoint_v1_blobs = {
      status: r1.status,
      statusText: r1.statusText,
      body: await r1.text(),
    }
  } catch (e) {
    results.endpoint_v1_blobs = { error: e instanceof Error ? e.message : String(e) }
  }

  // Try endpoint 2: /blobs
  try {
    const r2 = await fetch(`${apiUrl}/blobs`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: testData,
    })
    results.endpoint_blobs = {
      status: r2.status,
      statusText: r2.statusText,
      body: await r2.text(),
    }
  } catch (e) {
    results.endpoint_blobs = { error: e instanceof Error ? e.message : String(e) }
  }

  // Try endpoint 3: /v1/store
  try {
    const r3 = await fetch(`${apiUrl}/v1/store`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: testData,
    })
    results.endpoint_v1_store = {
      status: r3.status,
      statusText: r3.statusText,
      body: await r3.text(),
    }
  } catch (e) {
    results.endpoint_v1_store = { error: e instanceof Error ? e.message : String(e) }
  }

  // Try a GET on base URL to see what the API looks like
  try {
    const r4 = await fetch(`${apiUrl}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    results.base_url_get = {
      status: r4.status,
      body: (await r4.text()).slice(0, 300),
    }
  } catch (e) {
    results.base_url_get = { error: e instanceof Error ? e.message : String(e) }
  }

  return NextResponse.json(results, { status: 200 })
}
