'use client'
import { useState }     from 'react'
import { X, Lock, Loader2, ShieldCheck, Clock, Eye } from 'lucide-react'
import { useWallet }    from '@aptos-labs/wallet-adapter-react'
import type { ProfilrProfile } from '@/types'
import toast            from 'react-hot-toast'

interface Props {
  profile:      ProfilrProfile
  viewerWallet: string
  onClose:      () => void
  onSuccess:    () => void
}

export function PayAccessModal({ profile, viewerWallet, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const { signAndSubmitTransaction } = useWallet()

  const pay = async () => {
    setLoading(true)
    try {
      // Correct Aptos transaction format for wallet adapter v3+
      const result = await signAndSubmitTransaction({
        data: {
          function:          '0x1::coin::transfer' as `${string}::${string}::${string}`,
          typeArguments:     ['0x1::aptos_coin::AptosCoin'],
          functionArguments: [
            profile.walletAddress,
            Math.floor(profile.accessFeeUsdc * 1_000_000).toString(),
          ],
        },
      })

      const res = await fetch('/api/access/grant', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileBlobId: profile.profileBlobId,
          profileId:     profile.id,
          viewerWallet,
          ownerWallet:   profile.walletAddress,
          amountUsdc:    profile.accessFeeUsdc,
          txHash:        (result as { hash: string }).hash ?? 'testnet-tx',
        }),
      })

      if (!res.ok) throw new Error('Failed to record access')
      toast.success('Access granted — 7 days')
      onSuccess()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('cancel')) {
        toast.error('Transaction cancelled')
      } else {
        toast.error('Payment failed — please try again')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.15s ease' }}>
      <div className="w-full max-w-sm panel-modal animate-[fadeUp_0.2s_ease]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>Unlock profile</h2>
          <button onClick={onClose} className="btn-icon"><X size={16}/></button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">

          {/* Profile mini */}
          <div className="flex items-center gap-3 rounded-xl p-3 border"
            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}>
              {profile.displayName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{profile.displayName}</p>
              <p className="text-xs" style={{ color: 'var(--text-sub)' }}>{profile.title}</p>
            </div>
          </div>

          {/* What you get */}
          <div className="space-y-2.5">
            {[
              { icon: <Eye size={13}/>,         text: 'Full verified credential history' },
              { icon: <ShieldCheck size={13}/>,  text: 'GenLayer AI verification details' },
              { icon: <Clock size={13}/>,        text: '7-day access window' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-sub)' }}>
                <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="rounded-xl p-3 border space-y-2"
            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-sub)' }}>Access fee</span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>${profile.accessFeeUsdc} USDC</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-dim)' }}>Profile owner earns</span>
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                ${(profile.accessFeeUsdc * 0.7).toFixed(2)} USDC
              </span>
            </div>
            <div className="flex justify-between text-xs border-t pt-2" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-dim)' }}>Expires after</span>
              <span style={{ color: 'var(--text-dim)' }}>7 days — no downloads</span>
            </div>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            Payment processed on Aptos testnet. Access enforced by GenLayer. Recorded permanently on Shelby.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="btn-ghost flex-1" disabled={loading}>Cancel</button>
          <button onClick={pay} className="btn-primary flex-1" disabled={loading}>
            {loading
              ? <><Loader2 size={14} className="animate-spin"/>Processing…</>
              : <><Lock size={14}/>Pay ${profile.accessFeeUsdc} USDC</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
