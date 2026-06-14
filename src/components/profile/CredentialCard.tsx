'use client'
import { useState } from 'react'
import { ShieldCheck, Clock, AlertCircle, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react'
import type { Credential } from '@/types'
import { credEmoji, credLabel, fmtDate, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props { credential: Credential; readOnly?: boolean; onRefresh?: () => void }

export function CredentialCard({ credential, readOnly, onRefresh }: Props) {
  const [open, setOpen]         = useState(false)
  const [verifying, setVerify]  = useState(false)

  const requestVerification = async () => {
    setVerify(true)
    try {
      const res = await fetch('/api/verify', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ credentialId: credential.id, blobId: credential.blobId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Submitted to GenLayer validators')
      onRefresh?.()
    } catch { toast.error('Failed to submit') }
    finally { setVerify(false) }
  }

  const statusBadge = () => {
    if (credential.verificationStatus === 'verified')
      return <span className="badge-verified"><ShieldCheck size={11}/>Verified</span>
    if (credential.verificationStatus === 'reviewing' || credential.verificationStatus === 'pending')
      return <span className="badge-pending"><Clock size={11}/>{credential.verificationStatus === 'reviewing' ? 'Reviewing' : 'Pending'}</span>
    return <span className="badge-failed"><AlertCircle size={11}/>Failed</span>
  }

  return (
    <div className="card overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:border-[var(--accent-light)]/30">
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center text-base flex-shrink-0">{credEmoji(credential.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-[var(--text)] truncate">{credential.title}</p>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">{credential.institution}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {statusBadge()}
              {open ? <ChevronUp size={13} className="text-[var(--text-dim)]"/> : <ChevronDown size={13} className="text-[var(--text-dim)]"/>}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--text-dim)]">
            <span>{credLabel(credential.type)}</span>
            <span>·</span>
            <span>{fmtDate(credential.startDate)}{credential.endDate ? ` — ${fmtDate(credential.endDate)}` : credential.current ? ' — Present' : ''}</span>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] px-4 py-4 space-y-4 animate-fade-in bg-[var(--bg-subtle)]/40">
          {credential.description && <p className="text-sm text-[var(--text-sub)] leading-relaxed">{credential.description}</p>}
          <div className="bg-[var(--bg-panel)] rounded-xl p-3 border border-[var(--border)] space-y-2">
            <p className="label">Shelby storage</p>
            {[
              ['Blob ID', credential.blobId || 'Pending upload'],
              ['Merkle root', credential.merkleRoot ? credential.merkleRoot.slice(0,24)+'…' : '—'],
              credential.verifiedAt ? ['Verified', timeAgo(credential.verifiedAt)] : null,
            ].filter(Boolean).map(([k,v]) => (
              <div key={k as string} className="flex justify-between text-xs">
                <span className="text-[var(--text-dim)]">{k}</span>
                <span className="font-mono text-[var(--text-sub)] truncate max-w-[180px]">{v}</span>
              </div>
            ))}
          </div>
          {credential.verificationReason && (
            <div className="bg-[var(--accent-pale)] rounded-xl p-3 border border-[var(--accent)]/10">
              <p className="label text-[var(--accent)] mb-1">GenLayer verdict</p>
              <p className="text-xs text-[var(--text-sub)] leading-relaxed">{credential.verificationReason}</p>
            </div>
          )}
          {!readOnly && (
            <div className="flex items-center gap-2 flex-wrap">
              {credential.verificationStatus === 'pending' && (
                <button onClick={requestVerification} disabled={verifying} className="btn-primary text-xs h-8 px-4">
                  {verifying ? 'Submitting…' : <><ShieldCheck size={12}/>Verify with GenLayer</>}
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
