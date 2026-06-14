'use client'
import { useEffect, useState } from 'react'
import { Eye, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import type { AccessRecord } from '@/types'
import { timeAgo, daysLeft, isExpired, formatUsdc, truncateAddress } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props { walletAddress: string }

export function AccessHistoryPanel({ walletAddress }: Props) {
  const [records, setRecords] = useState<AccessRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [walletAddress])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/access/history?wallet=${walletAddress}`)
      if (!res.ok) throw new Error()
      setRecords((await res.json()).records ?? [])
    } catch { toast.error('Failed to load access history') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!records.length) return (
    <div className="card p-14 text-center">
      <Eye size={30} className="text-[var(--border)] mx-auto mb-3"/>
      <p className="text-sm font-semibold text-[var(--text-sub)]">No access history yet</p>
      <p className="text-xs text-[var(--text-dim)] mt-1">When a company pays to view your profile, it appears here</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--text-sub)]">{records.length} access records on Shelby</p>
        <button onClick={load} className="btn-ghost text-xs"><RefreshCw size={12}/>Refresh</button>
      </div>
      <div className="space-y-2 stagger">
        {records.map(r => (
          <div key={r.id} className="card p-4 flex items-center gap-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isExpired(r.expiresAt) ? 'bg-[var(--bg-subtle)]' : 'bg-[var(--accent-pale)]'
            }`}>
              <Eye size={14} className={isExpired(r.expiresAt) ? 'text-[var(--text-dim)]' : 'text-[var(--accent)]'}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono font-medium text-[var(--text)]">{truncateAddress(r.viewerWallet)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isExpired(r.expiresAt)
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-dim)]'
                    : 'bg-[var(--accent-pale)] text-[var(--accent)] border border-[var(--accent)]/20'
                }`}>
                  {isExpired(r.expiresAt) ? 'Expired' : `${daysLeft(r.expiresAt)}d remaining`}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-dim)]">
                <span className="flex items-center gap-1"><Clock size={10}/>{timeAgo(r.paidAt)}</span>
                <span className="font-semibold text-[var(--accent)]">+{formatUsdc(r.amountUsdc * 0.7)}</span>
              </div>
            </div>
            <a href={`https://explorer.aptoslabs.com/txn/${r.txHash}?network=testnet`}
              target="_blank" rel="noopener noreferrer" className="btn-icon flex-shrink-0">
              <ExternalLink size={13}/>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
