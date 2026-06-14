'use client'
import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Clock } from 'lucide-react'
import type { ProfilrProfile, AccessRecord } from '@/types'
import { formatUsdc, fmtDateFull, truncateAddress } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props { walletAddress: string; profile: ProfilrProfile | null }

export function EarningsPanel({ walletAddress, profile }: Props) {
  const [records, setRecords] = useState<AccessRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [walletAddress])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/access/history?wallet=${walletAddress}`)
      if (!res.ok) throw new Error()
      setRecords((await res.json()).records ?? [])
    } catch { toast.error('Failed to load earnings') }
    finally { setLoading(false) }
  }

  const totalEarned   = records.reduce((s, r) => s + r.amountUsdc * 0.7, 0)
  const totalPayments = records.length

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger">
        {[
          { icon:<DollarSign size={18}/>, label:'Total Earned',    value: formatUsdc(totalEarned),   sub:'Your 70% share' },
          { icon:<TrendingUp size={18}/>, label:'Total Payments',  value: totalPayments,             sub:'Companies paid to view' },
          { icon:<Clock size={18}/>,      label:'Access Mode',     value: profile?.accessMode === 'paid' ? `$${profile.accessFeeUsdc} USDC` : 'Free', sub:'Per 7-day window' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-pale)] flex items-center justify-center text-[var(--accent)] mb-3">{s.icon}</div>
            <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
            <p className="text-xs text-[var(--text-sub)] mt-1">{s.label}</p>
            <p className="text-xs text-[var(--text-dim)]">{s.sub}</p>
          </div>
        ))}
      </div>

      {records.length === 0 ? (
        <div className="card p-12 text-center">
          <DollarSign size={30} className="text-[var(--border)] mx-auto mb-3"/>
          <p className="text-sm font-semibold text-[var(--text-sub)]">No earnings yet</p>
          <p className="text-xs text-[var(--text-dim)] mt-1">Set your profile to paid and share your link to start earning</p>
        </div>
      ) : (
        <div>
          <p className="label mb-4">Payment history</p>
          <div className="space-y-2 stagger">
            {records.map(r => (
              <div key={r.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-mono text-[var(--text)]">{truncateAddress(r.viewerWallet)}</p>
                  <p className="text-xs text-[var(--text-dim)] mt-0.5">{fmtDateFull(r.paidAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--accent)]">+{formatUsdc(r.amountUsdc * 0.7)}</p>
                  <p className="text-xs text-[var(--text-dim)]">of {formatUsdc(r.amountUsdc)} total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
