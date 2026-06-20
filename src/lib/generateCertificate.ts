/**
 * Generates a simple certificate image client-side using the Canvas API.
 * Used by the admin "Generate test credential" tool to auto-attach a
 * placeholder certificate file, so admin doesn't need to manually upload one.
 */
export async function generateCertificateFile(params: {
  title: string
  institution: string
  recipientName: string
}): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width  = 1000
  canvas.height = 700
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#FAF7F2'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Border
  ctx.strokeStyle = '#E91E8C'
  ctx.lineWidth = 8
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)
  ctx.lineWidth = 1
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)

  // Header
  ctx.fillStyle = '#E91E8C'
  ctx.font = 'bold 28px Georgia'
  ctx.textAlign = 'center'
  ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 160)

  ctx.fillStyle = '#9E9E9E'
  ctx.font = '16px Arial'
  ctx.fillText('This certifies that', canvas.width / 2, 240)

  ctx.fillStyle = '#1A1A1A'
  ctx.font = 'bold 36px Georgia'
  ctx.fillText(params.recipientName, canvas.width / 2, 300)

  ctx.fillStyle = '#9E9E9E'
  ctx.font = '16px Arial'
  ctx.fillText('has successfully completed', canvas.width / 2, 360)

  ctx.fillStyle = '#1A1A1A'
  ctx.font = 'bold 26px Georgia'
  ctx.fillText(params.title, canvas.width / 2, 410)

  ctx.fillStyle = '#9E9E9E'
  ctx.font = '16px Arial'
  ctx.fillText(`Issued by ${params.institution}`, canvas.width / 2, 460)

  ctx.fillStyle = '#BDBDBD'
  ctx.font = '12px Arial'
  ctx.fillText(`Generated ${new Date().toLocaleDateString()} — Profilr testnet sample`, canvas.width / 2, 620)

  const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'))
  return new File([blob], `certificate-${Date.now()}.png`, { type: 'image/png' })
}
