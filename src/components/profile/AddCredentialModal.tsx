'use client'
import { useState, useRef } from 'react'
import { X, Upload, Loader2, Paperclip, FileText, Trash2 } from 'lucide-react'
import type { CredentialType } from '@/types'
import toast from 'react-hot-toast'

interface Props { walletAddress: string; onClose: () => void; onSuccess: () => void }

const TYPES: { value: CredentialType; label: string; emoji: string }[] = [
  { value:'education',     label:'Education',     emoji:'🎓' },
  { value:'work',          label:'Work',          emoji:'💼' },
  { value:'certification', label:'Certification', emoji:'📜' },
  { value:'project',       label:'Project',       emoji:'🚀' },
  { value:'skill',         label:'Skill',         emoji:'⚡' },
  { value:'award',         label:'Award',         emoji:'🏆' },
]

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.webp'
const MAX_FILE_MB = 5

export function AddCredentialModal({ walletAddress, onClose, onSuccess }: Props) {
  const [loading, setLoading]   = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [file, setFile]         = useState<File | null>(null)
  const fileInputRef            = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    type: 'education' as CredentialType,
    title: '', institution: '', description: '',
    startDate: '', endDate: '', current: false, credentialUrl: '',
  })
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File too large — max ${MAX_FILE_MB}MB`)
      return
    }
    setFile(f)
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = async () => {
    if (!form.title || !form.institution) { toast.error('Title and institution required'); return }
    setLoading(true)
    try {
      // Step 1 — create the credential record
      const res = await fetch('/api/credential/upload', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, walletAddress }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      const { credential } = await res.json()

      // Step 2 — if a file was attached, upload it and link to the credential
      if (file) {
        setUploadingFile(true)
        const fd = new FormData()
        fd.append('file', file)
        fd.append('credentialId', credential.id)
        fd.append('walletAddress', walletAddress)

        const fileRes = await fetch('/api/credential/upload-file', { method: 'POST', body: fd })
        if (!fileRes.ok) {
          toast.error('Credential saved, but file attachment failed')
        }
        setUploadingFile(false)
      }

      toast.success('Credential stored on Shelby ✓')
      onSuccess()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
      setUploadingFile(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg panel-modal animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold" style={{ color: 'var(--text)' }}>Add credential</h2>
          <button onClick={onClose} className="btn-icon"><X size={16}/></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Type selector */}
          <div>
            <label className="label block mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button key={t.value} onClick={() => set('type', t.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-all flex items-center gap-1.5 justify-center ${
                    form.type === t.value
                      ? 'border-[var(--accent)] bg-[var(--accent-pale)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-sub)] hover:border-[var(--accent)]/30'
                  }`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label block mb-1.5">Title *</label>
            <input className="input" placeholder="e.g. BSc Computer Science" value={form.title} onChange={e=>set('title',e.target.value)}/>
          </div>
          <div>
            <label className="label block mb-1.5">Institution / Company *</label>
            <input className="input" placeholder="e.g. University of Lagos" value={form.institution} onChange={e=>set('institution',e.target.value)}/>
          </div>
          <div>
            <label className="label block mb-1.5">Description</label>
            <textarea className="input resize-none h-20" placeholder="Brief description..." value={form.description} onChange={e=>set('description',e.target.value)}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1.5">Start date</label>
              <input type="month" className="input" value={form.startDate} onChange={e=>set('startDate',e.target.value)}/>
            </div>
            <div>
              <label className="label block mb-1.5">End date</label>
              <input type="month" className="input" value={form.endDate} disabled={form.current} onChange={e=>set('endDate',e.target.value)}/>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => set('current',!form.current)}
              className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${form.current ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.current ? 'translate-x-5' : ''}`}/>
            </div>
            <span className="text-sm" style={{ color: 'var(--text-sub)' }}>Currently ongoing</span>
          </label>
          <div>
            <label className="label block mb-1.5">Credential URL (optional)</label>
            <input className="input" placeholder="https://certificate.example.com/..." value={form.credentialUrl} onChange={e=>set('credentialUrl',e.target.value)}/>
          </div>

          {/* File attachment */}
          <div>
            <label className="label block mb-1.5">Attach proof — certificate, diploma, award (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileSelect}
              className="hidden"
              id="credential-file-input"
            />
            {!file ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed text-sm transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-dim)' }}
              >
                <Paperclip size={15}/>
                Click to attach a file — PDF, JPG, PNG (max {MAX_FILE_MB}MB)
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
                <FileText size={16} style={{ color: 'var(--accent)' }}/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button type="button" onClick={removeFile} className="btn-icon w-7 h-7 text-red-500">
                  <Trash2 size={13}/>
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl p-3 border text-xs leading-relaxed" style={{ background: 'var(--accent-pale)', borderColor: 'rgba(233,30,140,0.1)', color: 'var(--text-sub)' }}>
            This credential will be stored as an immutable blob on <strong style={{ color: 'var(--accent)' }}>Shelby Protocol</strong>. GenLayer AI validators will verify it against public sources.
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
          <button onClick={submit} className="btn-primary" disabled={loading}>
            {loading
              ? <><Loader2 size={14} className="animate-spin"/>{uploadingFile ? 'Uploading file…' : 'Saving…'}</>
              : <><Upload size={14}/>Store on Shelby</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
