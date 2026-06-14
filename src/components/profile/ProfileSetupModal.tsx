'use client'
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { ProfilrProfile } from '@/types'
import toast from 'react-hot-toast'

interface Props { profile: ProfilrProfile | null; walletAddress: string; onClose: () => void; onSuccess: (p: ProfilrProfile) => void }

export function ProfileSetupModal({ profile, walletAddress, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    displayName:   profile?.displayName   ?? '',
    title:         profile?.title         ?? '',
    bio:           profile?.bio           ?? '',
    location:      profile?.location      ?? '',
    website:       profile?.website       ?? '',
    accessMode:    profile?.accessMode    ?? 'free',
    accessFeeUsdc: profile?.accessFeeUsdc ?? 2,
  })
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    if (!form.displayName) { toast.error('Display name required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/profile/save', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, walletAddress }),
      })
      if (!res.ok) throw new Error()
      toast.success('Profile saved to Shelby ✓')
      onSuccess((await res.json()).profile)
    } catch { toast.error('Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg panel-modal animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="font-bold text-[var(--text)]">{profile ? 'Edit profile' : 'Set up your profile'}</h2>
          <button onClick={onClose} className="btn-icon"><X size={16}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="label block mb-1.5">Display name *</label><input className="input" placeholder="Your full name" value={form.displayName} onChange={e=>set('displayName',e.target.value)}/></div>
          <div><label className="label block mb-1.5">Professional title</label><input className="input" placeholder="e.g. Senior Software Engineer" value={form.title} onChange={e=>set('title',e.target.value)}/></div>
          <div><label className="label block mb-1.5">Bio</label><textarea className="input resize-none h-20" placeholder="Brief summary..." value={form.bio} onChange={e=>set('bio',e.target.value)}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label block mb-1.5">Location</label><input className="input" placeholder="Lagos, Nigeria" value={form.location} onChange={e=>set('location',e.target.value)}/></div>
            <div><label className="label block mb-1.5">Website</label><input className="input" placeholder="https://..." value={form.website} onChange={e=>set('website',e.target.value)}/></div>
          </div>
          <div>
            <label className="label block mb-2">Access mode</label>
            <div className="grid grid-cols-2 gap-3">
              {[{v:'free',l:'Free',d:'Anyone with your link can view'},{v:'paid',l:'Paid',d:'Viewers pay USDC for 7-day access'}].map(o=>(
                <button key={o.v} onClick={()=>set('accessMode',o.v)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${form.accessMode===o.v ? 'border-[var(--accent)] bg-[var(--accent-pale)]' : 'border-[var(--border)] hover:border-[var(--accent)]/30'}`}>
                  <p className={`text-sm font-bold ${form.accessMode===o.v ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>{o.l}</p>
                  <p className="text-xs text-[var(--text-dim)] mt-0.5">{o.d}</p>
                </button>
              ))}
            </div>
          </div>
          {form.accessMode === 'paid' && (
            <div>
              <label className="label block mb-1.5">Access fee (USDC) · You earn 70%</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-dim)]">$</span>
                <input type="number" min="1" max="100" className="input pl-8" value={form.accessFeeUsdc}
                  onChange={e=>set('accessFeeUsdc', parseFloat(e.target.value)||2)}/>
              </div>
              <p className="text-xs text-[var(--text-dim)] mt-1">You earn ${(form.accessFeeUsdc*0.7).toFixed(2)} per access</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border)]">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
          <button onClick={save} className="btn-primary" disabled={loading}>
            {loading ? <><Loader2 size={14} className="animate-spin"/>Saving…</> : 'Save profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
