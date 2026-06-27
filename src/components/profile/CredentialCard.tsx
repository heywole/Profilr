'use client'
import { useState } from 'react'
import {
  ShieldCheck, Clock, AlertCircle, ChevronDown, ChevronUp,
  ExternalLink, RefreshCw, Database, Zap, CheckCircle2
} from 'lucide-react'
import type { Credential } from '@/types'
import { credEmoji, credLabel, fmtDate, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props { credential: Credential; readOnly?: boolean; onRefresh?: () => void }

export function CredentialCard({ credential, readOnly, onRefresh }: Props) {
  const [open,     setOpen]     = useState(false)
  const [verifying, setVerify]  = useState(false)
  const [txHash,   setTxHash]   = useState<string | null>(null)

  const requestVerification = async () => {
    setVerify(true)
    try {
      const res = await fetch('/api/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ credentialId: credential.id, blobId: credential.blobId }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.txHash) setTxHash(data.txHash)
      toast.success('Submitted to GenLayer — 5 AI validators are reviewing')
      onRefresh?.()
    } catch {
      toast.error('Failed to submit for verification')
    } finally {
      setVerify(false) }
  }

  const statusBadge = () => {
    switch (credential.verificationStatus) {
      case 'verified':
        return <span className="badge-verified"><ShieldCheck size={11}/>Verified</span>
      case 'reviewing':
        return <span className="badge-pending"><Clock size={11}/>Reviewing</span>
      case 'pending':
        return <span className="badge-pending"><Clock size={11}/>Pending</span>
      case 'failed':
        return <span className="badge-failed"><AlertCircle size={11}/>Failed</span>
    }
  }

  const isLocalBlob = credential.blobId?.startsWith('local_')

  // Typed rows to avoid TS error
  const storageRows: [string, string][] = [
    ['Blob ID', credential.blobId || 'Not stored'],
    ['Storage', isLocalBlob ? 'Local fallback (Shelby pending)' : 'Shelby Protocol'],
    ['Merkle root', credential.merkleRoot
      ? credential.merkleRoot.slice(0, 20) + '…'
      : '—'],
  ]
  if (credential.verifiedAt) {
    storageRows.push(['Verified', timeAgo(credential.verifiedAt)])
  }

  return (
    <div className="card overflow-hidden transition-all duration-200"
      style={{ borderColor: open ? 'rgba(233,30,140,0.2)' : 'var(--border)' }}>

      {/* Header row */}
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'var(--bg-subtle)' }}>
          {credEmoji(credential.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                {credential.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>
                {credential.institution}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {statusBadge()}
              {open
                ? <ChevronUp   size={13} style={{ color: 'var(--text-dim)' }}/>
                : <ChevronDown size={13} style={{ color: 'var(--text-dim)' }}/>
              }
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
            <span>{credLabel(credential.type)}</span>
            <span>·</span>
            <span>
              {fmtDate(credential.startDate)}
              {credential.endDate
                ? ` — ${fmtDate(credential.endDate)}`
                : credential.current ? ' — Present' : ''
              }
            </span>
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {open && (
        <div className="border-t px-4 py-4 space-y-4"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>

          {credential.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>
              {credential.description}
            </p>
          )}

          {/* Storage section */}
          <div className="rounded-xl p-3 border space-y-2"
            style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Database size={12} style={{ color: 'var(--accent)' }}/>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                Shelby Storage
              </p>
              {isLocalBlob && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                  style={{ background: 'var(--bg-muted)', color: 'var(--text-dim)' }}>
                  Shelby API pending
                </span>
              )}
            </div>
            {storageRows.map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-dim)' }}>{k}</span>
                <span className="font-mono truncate max-w-[200px]" style={{ color: 'var(--text-sub)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* GenLayer section */}
          <div className="rounded-xl p-3 border space-y-2"
            style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={12} style={{ color: 'var(--accent)' }}/>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                GenLayer Verification
              </p>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-dim)' }}>Status</span>
              <span className="font-medium capitalize" style={{ color:
                credential.verificationStatus === 'verified' ? '#16a34a' :
                credential.verificationStatus === 'failed'   ? '#dc2626' :
                'var(--text-sub)'
              }}>
                {credential.verificationStatus}
              </span>
            </div>
            {(txHash || credential.verificationBlobId) && (
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-dim)' }}>Tx hash</span>
                <a
                  href={`https://explorer-studio.genlayer.com/tx/${txHash ?? credential.verificationBlobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono truncate max-w-[180px] hover:underline flex items-center gap-1"
                  style={{ color: 'var(--accent)' }}
                >
                  {(txHash ?? credential.verificationBlobId ?? '').slice(0, 18)}…
                  <ExternalLink size={10}/>
                </a>
              </div>
            )}
            {credential.verificationReason && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>
                  {credential.verificationReason}
                </p>
              </div>
            )}
          </div>

          {/* File attachment */}
          {credential.fileName && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-lg"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={12} style={{ color: 'var(--accent)' }}/>
              <span style={{ color: 'var(--text-sub)' }}>Attached:</span>
              <span className="font-medium truncate" style={{ color: 'var(--text)' }}>{credential.fileName}</span>
              <span style={{ color: 'var(--text-dim)' }}>
                ({credential.fileSize ? Math.round(credential.fileSize / 1024) + ' KB' : ''})
              </span>
            </div>
          )}

          {/* Actions */}
          {!readOnly && (
            <div className="flex items-center gap-2 flex-wrap">
              {credential.verificationStatus === 'pending' && (
                <button
                  onClick={requestVerification}
                  disabled={verifying}
                  className="btn-primary text-xs h-8 px-4">
                  {verifying
                    ? 'Submitting to GenLayer…'
                    : <><ShieldCheck size={12}/>Verify with GenLayer</>
                  }
                </button>
              )}
              {credential.verificationStatus === 'failed' && (
                <button
                  onClick={requestVerification}
                  disabled={verifying}
                  className="btn-outline text-xs h-8 px-4">
                  <RefreshCw size={12}/>Retry verification
                </button>
              )}
              {credential.credentialUrl && (
                <a href={credential.credentialUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
                  <ExternalLink size={12}/>View source
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
