'use client'
import { useState } from 'react'
import { ShieldCheck, Clock, AlertCircle, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react'
import type { Credential } from '@/types'
import { credEmoji, credLabel, fmtDate, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props { credential: Credential; readOnly?: boolean; onRefresh?: () => void }

export function CredentialCard({ credential, readOnly, onRefresh }: Props) {
  const [open, setOpen]        = useState(false)
  const [verifying, setVerify] = useState(false)

  const requestVerification = async () => {
    setVerify(true)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId: credential.id, blobId: credential.blobId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Submitted to GenLayer validators')
      onRefresh?.()
    } catch {
      toast.error('Failed to submit')
    } finally {
      setVerify(false) }
  }

  const statusBadge = () => {
    if (credential.verificationStatus === 'verified')
      return <span className="badge-verified"><ShieldCheck size={11}/>Verified</span>
    if (credential.verificationStatus === 'reviewing' || credential.verificationStatus === 'pending')
      return <span className="badge-pending"><Clock size={11}/>{credential.verificationStatus === 'reviewing' ? 'Reviewing' : 'Pending'}</span>
    return <span className="badge-failed"><AlertCircle size={11}/>Failed</span>
  }

  // Fixed: typed rows array to avoid TS null issue
  const shelbyRows: [string, string][] = [
    ['Blob ID', credential.blobId || 'Pending upload'],
    ['Merkle root', credential.merkleRoot ? credential.merkleRoot.slice(0, 24) + '…' : '—'],
  ]
  if (credential.verifiedAt) {
    shelbyRows.push(['Verified', timeAgo(credential.verifiedAt)])
  }

  return (
    <div className="card overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
      style={{ borderColor: open ? 'rgba(233,30,140,0.2)' : 'var(--border)' }}>

      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'var(--bg-subtle)' }}>
          {credEmoji(credential.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{credential.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>{credential.institution}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {statusBadge()}
              {open
                ? <ChevronUp size={13} style={{ color: 'var(--text-dim)' }}/>
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

      {open && (
        <div className="border-t px-4 py-4 space-y-4"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', animation: 'fadeIn 0.2s ease' }}>

          {credential.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>
              {credential.description}
            </p>
          )}

          {/* Shelby storage info */}
          <div className="rounded-xl p-3 border space-y-2"
            style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
              Shelby storage
            </p>
            {shelbyRows.map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-dim)' }}>{k}</span>
                <span className="font-mono truncate max-w-[180px]" style={{ color: 'var(--text-sub)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* GenLayer verdict */}
          {credential.verificationReason && (
            <div className="rounded-xl p-3 border"
              style={{ background: 'var(--accent-pale)', borderColor: 'rgba(233,30,140,0.1)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
                GenLayer verdict
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>
                {credential.verificationReason}
              </p>
            </div>
          )}

          {/* Actions */}
          {!readOnly && (
            <div className="flex items-center gap-2 flex-wrap">
              {credential.verificationStatus === 'pending' && (
                <button onClick={requestVerification} disabled={verifying} className="btn-primary text-xs h-8 px-4">
                  {verifying
                    ? 'Submitting…'
                    : <><ShieldCheck size={12}/>Verify with GenLayer</>
                  }
                </button>
              )}
              {credential.verificationStatus === 'failed' && (
                <button onClick={requestVerification} disabled={verifying} className="btn-outline text-xs h-8 px-4">
                  <RefreshCw size={12}/>Retry
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
