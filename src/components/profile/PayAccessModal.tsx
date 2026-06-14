'use client'
import { useState } from 'react'
import { X, Lock, Loader2, ShieldCheck, Clock, Eye } from 'lucide-react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import type { ProfilrProfile } from '@/types'
import toast from 'react-hot-toast'

interface Props { profile: ProfilrProfile; viewerWallet: string; onClose: () => void; onSuccess: () => void }

export function PayAccessModal({ profile, viewerWallet, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const { signAndSubmitTransaction } = useWallet()

  const pay = async () => {
    setLoading(true)
    try {
      const result = await signAndSubmitTransaction({
        type: 'entry_function_payload',
        function: '0x1::coin::transfer',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
        arguments: [profile.walletAddress, (profile.accessFeeUsdc * 1_000_000).toString()],
      } as Parameters<typeof signAndSubmitTransaction>[0])

      const res = await fetch('/api/access/grant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileBlobId: profile.profileBlobId,
          profileId:     profile.id,
          viewerWallet,
          ownerWallet:   profile.walletAddress,
          amountUsdc:    profile.accessFeeUsdc,
          txHash:        result.hash,
        }),
      })
      if (!res.ok) throw new Error('Failed to record access')
      toast.success('Access granted — 7 days ✓')
      onSuccess()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      toast.error(msg.includes('rejected') ? 'Transaction cancelled' : 'Payment failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm panel-modal animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="font-bold text-[var(--text)]">Unlock profile</h2>
          <button onClick={onClose} className="btn-icon"><X size={16}/></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Profile mini card */}
          <div className="flex items-center gap-3 bg-[var(--bg-subtle)] rounded-xl p-3 border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-pale)] flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--accent)] font-bold">{profile.displayName?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{profile.displayName}</p>
              <p className="text-xs text-[var(--text-sub)]">{profile.title}</p>
            </div>
          </div>
          {/* What you get */}
          <div className="space-y-2.5">
            {[
              { icon:<Eye size={13}/>,         text:'Full verified credential history' },
              { icon:<ShieldCheck size={13}/>,  text:'GenLayer AI verification details' },
              { icon:<Clock size={13}/>,        text:'7-day access window' },
            ].map((i,idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm text-[var(--text-sub)]">
                <span className="text-[var(--accent)]">{i.icon}</span>{i.text}
              </div>
            ))}
          </div>
          {/* Price */}
          <div className="bg-[var(--bg-subtle)] rounded-xl p-3 border border-[var(--border)] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-sub)]">Access fee</span>
              <span className="font-bold text-[var(--text)]">${profile.accessFeeUsdc} USDC</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-dim)]">Profile owner earns</span>
              <span className="font-semibold text-[var(--accent)]">${(profile.accessFeeUsdc * 0.7).toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-xs border-t border-[var(--border)] pt-2">
              <span className="text-[var(--text-dim)]">Expires after</span>
              <span className="text-[var(--text-dim)]">7 days · no downloads</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            Payment processed on Aptos testnet. Access enforced by GenLayer. Recorded permanently on Shelby.
          </p>
        </div>
        <div className="flex gap-3 p-5 border-t border-[var(--border)]">
          <button onClick={onClose} className="btn-ghost flex-1" disabled={loading}>Cancel</button>
          <button onClick={pay} className="btn-primary flex-1" disabled={loading}>
            {loading ? <><Loader2 size={14} className="animate-spin"/>Processing…</> : <><Lock size={14}/>Pay ${profile.accessFeeUsdc} USDC</>}
          </button>
        </div>
      </div>
    </div>
  )
}
