'use client'
import { useEffect, useState, useCallback } from 'react'
import { useWallet }              from '@aptos-labs/wallet-adapter-react'
import { useRouter }              from 'next/navigation'
import { Navbar }                 from '@/components/layout/Navbar'
import {
  ShieldCheck, Users, FileText, DollarSign,
  Eye, AlertTriangle, Ban, Flag, CheckCircle,
  ExternalLink, RefreshCw, Search, ChevronDown, ChevronUp, Activity,
} from 'lucide-react'
import { truncateAddress, formatUsdc, timeAgo, credLabel, credEmoji, daysLeft, isExpired } from '@/lib/utils'
import type { ProfilrProfile, Credential, AccessRecord } from '@/types'
import toast from 'react-hot-toast'

type Tab = 'overview' | 'profiles' | 'credentials' | 'payments' | 'banned'

interface AdminStats {
  totalProfiles:    number
  totalCredentials: number
  totalPayments:    number
  platformEarnings: number
  activeAccess:     number
}

interface AdminProfile extends ProfilrProfile {
  isBanned:  boolean
  isFlagged: boolean
  banReason?: string
}

interface AdminPayment extends AccessRecord {
  platformCut:  number
  ownerWallet?: string
}

export default function AdminPage() {
  const { account, connected } = useWallet()
  const router                 = useRouter()
  const adminWallet            = process.env.NEXT_PUBLIC_ADMIN_WALLET ?? ''

  const [tab,         setTab]         = useState<Tab>('overview')
  const [stats,       setStats]       = useState<AdminStats | null>(null)
  const [profiles,    setProfiles]    = useState<AdminProfile[]>([])
  const [credentials, setCredentials] = useState<(Credential & { ownerWallet: string })[]>([])
  const [payments,    setPayments]    = useState<AdminPayment[]>([])
  const [banned,      setBanned]      = useState<Record<string, string>>({})
  const [flagged,     setFlagged]     = useState<Record<string, string>>({})
  const [loading,     setLoading]     = useState(true)
  const [query,       setQuery]       = useState('')
  const [banTarget,   setBanTarget]   = useState('')
  const [banReason,   setBanReason]   = useState('')
  const [expanded,    setExpanded]    = useState<string | null>(null)

  // Guard — redirect if not admin wallet
  useEffect(() => {
    if (!connected) { router.push('/'); return }
    if (account?.address?.toString().toLowerCase() !== adminWallet.toLowerCase()) {
      router.push('/')
    }
  }, [connected, account])

  const authHeader = { 'x-admin-wallet': account?.address?.toString() ?? '' }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, pRes, cRes, payRes, banRes] = await Promise.all([
        fetch('/api/admin/stats',       { headers: authHeader }),
        fetch('/api/admin/profiles',    { headers: authHeader }),
        fetch('/api/admin/credentials', { headers: authHeader }),
        fetch('/api/admin/payments',    { headers: authHeader }),
        fetch('/api/admin/ban',         { headers: authHeader }),
      ])
      const [s, p, c, pay, ban] = await Promise.all([
        sRes.json(), pRes.json(), cRes.json(), payRes.json(), banRes.json(),
      ])
      setStats(s)
      setProfiles(p.profiles ?? [])
      setCredentials(c.credentials ?? [])
      setPayments(pay.payments ?? [])
      setBanned(ban.banned ?? {})
      setFlagged(ban.flagged ?? {})
    } catch { toast.error('Failed to load admin data') }
    finally { setLoading(false) }
  }, [account])

  useEffect(() => { if (connected && account) fetchAll() }, [connected, account])

  const moderateWallet = async (action: string, wallet: string, reason?: string) => {
    try {
      const res = await fetch('/api/admin/ban', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body:    JSON.stringify({ action, wallet, reason }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${action} applied to ${truncateAddress(wallet)}`)
      fetchAll()
    } catch { toast.error('Action failed') }
  }

  if (!connected || account?.address?.toString().toLowerCase() !== adminWallet.toLowerCase()) {
    return null
  }

  const filteredProfiles = profiles.filter(p =>
    !query ||
    p.displayName?.toLowerCase().includes(query.toLowerCase()) ||
    p.walletAddress?.toLowerCase().includes(query.toLowerCase())
  )
  const filteredCreds = credentials.filter(c =>
    !query ||
    c.title?.toLowerCase().includes(query.toLowerCase()) ||
    c.institution?.toLowerCase().includes(query.toLowerCase()) ||
    c.ownerWallet?.toLowerCase().includes(query.toLowerCase())
  )
  const filteredPay = payments.filter(p =>
    !query ||
    p.viewerWallet?.toLowerCase().includes(query.toLowerCase()) ||
    (p as AdminPayment & { ownerWallet?: string }).ownerWallet?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar/>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <ShieldCheck size={14} className="text-white"/>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Admin Panel</h1>
            </div>
            <p className="text-sm text-[var(--text-dim)] font-mono">{truncateAddress(account?.address?.toString() ?? '')}</p>
          </div>
          <button onClick={fetchAll} className="btn-outline text-xs h-9">
            <RefreshCw size={13}/> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] mb-8 gap-0 overflow-x-auto">
          {([
            { key:'overview',    label:'Overview',    icon:<Activity size={14}/> },
            { key:'profiles',    label:'Profiles',    icon:<Users size={14}/> },
            { key:'credentials', label:'Credentials', icon:<FileText size={14}/> },
            { key:'payments',    label:'Payments',    icon:<DollarSign size={14}/> },
            { key:'banned',      label:'Moderation',  icon:<Ban size={14}/> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                tab === t.key
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-sub)] hover:text-[var(--text)]'
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger">
                  {[
                    { icon:<Users size={18}/>,       label:'Total Profiles',    value: stats.totalProfiles,                color:'text-blue-500' },
                    { icon:<FileText size={18}/>,    label:'Total Credentials', value: stats.totalCredentials,             color:'text-purple-500' },
                    { icon:<DollarSign size={18}/>,  label:'Total Payments',    value: stats.totalPayments,                color:'text-emerald-500' },
                    { icon:<Activity size={18}/>,    label:'Active Access',     value: stats.activeAccess,                 color:'text-[var(--accent)]' },
                    { icon:<DollarSign size={18}/>,  label:'Platform Earned',   value: formatUsdc(stats.platformEarnings), color:'text-[var(--accent)]' },
                  ].map(s => (
                    <div key={s.label} className="card p-5">
                      <div className={`w-10 h-10 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center mb-3 ${s.color}`}>
                        {s.icon}
                      </div>
                      <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
                      <p className="text-xs text-[var(--text-sub)] mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent profiles */}
                <div>
                  <p className="label mb-4">Recent profiles</p>
                  <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)]">
                        <tr>
                          {['Wallet','Name','Credentials','Mode','Status','Joined'].map(h => (
                            <th key={h} className="px-4 py-3 text-left label">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profiles.slice(0, 8).map(p => (
                          <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-subtle)]/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-[var(--text-dim)]">{truncateAddress(p.walletAddress)}</td>
                            <td className="px-4 py-3 font-medium text-[var(--text)]">{p.displayName}</td>
                            <td className="px-4 py-3 text-[var(--text-sub)]">{p.credentials.length}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                p.accessMode === 'paid'
                                  ? 'bg-[var(--accent-pale)] text-[var(--accent)]'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {p.accessMode === 'paid' ? `$${p.accessFeeUsdc}` : 'Free'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {p.isBanned
                                ? <span className="text-xs text-red-500 font-medium">Banned</span>
                                : p.isFlagged
                                ? <span className="text-xs text-amber-500 font-medium">Flagged</span>
                                : <span className="text-xs text-emerald-600 font-medium">Active</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-xs text-[var(--text-dim)]">{timeAgo(p.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFILES ── */}
            {tab === 'profiles' && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"/>
                    <input className="input pl-9" placeholder="Search name or wallet…" value={query} onChange={e => setQuery(e.target.value)}/>
                  </div>
                  <p className="text-sm text-[var(--text-dim)]">{filteredProfiles.length} profiles</p>
                </div>

                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)]">
                      <tr>
                        {['Profile','Credentials','Verified','Access Mode','Earnings','Status','Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left label">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map(p => {
                        const verifiedCount = p.credentials.filter(c => c.verificationStatus === 'verified').length
                        return (
                          <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-subtle)]/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[var(--accent-pale)] flex items-center justify-center flex-shrink-0">
                                  <span className="text-[var(--accent)] font-bold text-sm">{p.displayName?.[0]?.toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-[var(--text)]">{p.displayName}</p>
                                  <p className="text-xs font-mono text-[var(--text-dim)]">{truncateAddress(p.walletAddress)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[var(--text-sub)]">{p.credentials.length}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                <ShieldCheck size={11}/>{verifiedCount}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                p.accessMode === 'paid' ? 'bg-[var(--accent-pale)] text-[var(--accent)]' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {p.accessMode === 'paid' ? `$${p.accessFeeUsdc} USDC` : 'Free'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-[var(--accent)]">
                              {formatUsdc(p.totalEarnings ?? 0)}
                            </td>
                            <td className="px-4 py-3">
                              {p.isBanned
                                ? <span className="text-xs text-red-500 font-medium flex items-center gap-1"><Ban size={10}/>Banned</span>
                                : p.isFlagged
                                ? <span className="text-xs text-amber-500 font-medium flex items-center gap-1"><Flag size={10}/>Flagged</span>
                                : <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle size={10}/>Active</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <a href={`/profile/${p.walletAddress}`} target="_blank" rel="noopener noreferrer" className="btn-icon w-7 h-7">
                                  <ExternalLink size={12}/>
                                </a>
                                {p.isBanned ? (
                                  <button onClick={() => moderateWallet('unban', p.walletAddress)} className="btn-icon w-7 h-7 text-emerald-600 hover:bg-emerald-50">
                                    <CheckCircle size={12}/>
                                  </button>
                                ) : (
                                  <>
                                    {!p.isFlagged && (
                                      <button onClick={() => moderateWallet('flag', p.walletAddress, 'Flagged by admin')} className="btn-icon w-7 h-7 text-amber-500 hover:bg-amber-50">
                                        <Flag size={12}/>
                                      </button>
                                    )}
                                    <button onClick={() => moderateWallet('ban', p.walletAddress, 'Banned by admin')} className="btn-icon w-7 h-7 text-red-500 hover:bg-red-50">
                                      <Ban size={12}/>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredProfiles.length === 0 && (
                    <div className="p-10 text-center text-sm text-[var(--text-dim)]">No profiles found</div>
                  )}
                </div>
              </div>
            )}

            {/* ── CREDENTIALS ── */}
            {tab === 'credentials' && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"/>
                    <input className="input pl-9" placeholder="Search title, institution or wallet…" value={query} onChange={e => setQuery(e.target.value)}/>
                  </div>
                  <p className="text-sm text-[var(--text-dim)]">{filteredCreds.length} credentials</p>
                </div>

                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)]">
                      <tr>
                        {['Credential','Owner','Type','Status','Submitted','Blob ID'].map(h => (
                          <th key={h} className="px-4 py-3 text-left label">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCreds.map(c => (
                        <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-subtle)]/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{credEmoji(c.type)}</span>
                              <div>
                                <p className="font-semibold text-[var(--text)]">{c.title}</p>
                                <p className="text-xs text-[var(--text-sub)]">{c.institution}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[var(--text-dim)]">{truncateAddress(c.ownerWallet)}</td>
                          <td className="px-4 py-3 text-xs text-[var(--text-sub)] capitalize">{credLabel(c.type)}</td>
                          <td className="px-4 py-3">
                            {c.verificationStatus === 'verified' && <span className="badge-verified text-[10px]"><ShieldCheck size={9}/>Verified</span>}
                            {(c.verificationStatus === 'pending' || c.verificationStatus === 'reviewing') && <span className="badge-pending text-[10px]">Pending</span>}
                            {c.verificationStatus === 'failed' && <span className="badge-failed text-[10px]">Failed</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--text-dim)]">{timeAgo(c.createdAt)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-[var(--text-dim)] max-w-[120px] truncate">{c.blobId || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCreds.length === 0 && (
                    <div className="p-10 text-center text-sm text-[var(--text-dim)]">No credentials found</div>
                  )}
                </div>
              </div>
            )}

            {/* ── PAYMENTS ── */}
            {tab === 'payments' && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"/>
                    <input className="input pl-9" placeholder="Search by wallet…" value={query} onChange={e => setQuery(e.target.value)}/>
                  </div>
                  <div className="card px-4 py-2">
                    <p className="text-xs text-[var(--text-dim)]">Platform total</p>
                    <p className="text-sm font-bold text-[var(--accent)]">
                      {formatUsdc(filteredPay.reduce((s, p) => s + p.platformCut, 0))}
                    </p>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)]">
                      <tr>
                        {['Viewer','Profile Owner','Amount','Your Cut (20%)','Status','Date','Tx'].map(h => (
                          <th key={h} className="px-4 py-3 text-left label">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPay.map(p => (
                        <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-subtle)]/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-[var(--text-dim)]">{truncateAddress(p.viewerWallet)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-[var(--text-dim)]">{truncateAddress((p as AdminPayment & { ownerWallet?: string }).ownerWallet ?? '')}</td>
                          <td className="px-4 py-3 font-semibold text-[var(--text)]">{formatUsdc(p.amountUsdc)}</td>
                          <td className="px-4 py-3 font-bold text-[var(--accent)]">{formatUsdc(p.platformCut)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              p.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-[var(--bg-subtle)] text-[var(--text-dim)]'
                            }`}>
                              {p.isActive ? `${daysLeft(p.expiresAt)}d left` : 'Expired'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--text-dim)]">{timeAgo(p.paidAt)}</td>
                          <td className="px-4 py-3">
                            <a href={`https://explorer.aptoslabs.com/txn/${p.txHash}?network=testnet`}
                              target="_blank" rel="noopener noreferrer" className="btn-icon w-7 h-7">
                              <ExternalLink size={12}/>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPay.length === 0 && (
                    <div className="p-10 text-center text-sm text-[var(--text-dim)]">No payments yet</div>
                  )}
                </div>
              </div>
            )}

            {/* ── MODERATION ── */}
            {tab === 'banned' && (
              <div className="space-y-8">

                {/* Manual ban form */}
                <div className="card p-5">
                  <p className="label mb-4">Manual moderation</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      className="input flex-1"
                      placeholder="Wallet address to ban or flag…"
                      value={banTarget}
                      onChange={e => setBanTarget(e.target.value)}
                    />
                    <input
                      className="input flex-1"
                      placeholder="Reason (optional)"
                      value={banReason}
                      onChange={e => setBanReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { if (banTarget) { moderateWallet('flag', banTarget, banReason); setBanTarget(''); setBanReason('') }}}
                        className="btn-outline text-sm text-amber-500 border-amber-400 hover:bg-amber-50 whitespace-nowrap">
                        <Flag size={13}/> Flag
                      </button>
                      <button
                        onClick={() => { if (banTarget) { moderateWallet('ban', banTarget, banReason); setBanTarget(''); setBanReason('') }}}
                        className="btn-primary bg-red-500 hover:bg-red-600 shadow-none text-sm whitespace-nowrap">
                        <Ban size={13}/> Ban
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banned wallets */}
                <div>
                  <p className="label mb-4">Banned wallets ({Object.keys(banned).length})</p>
                  {Object.keys(banned).length === 0 ? (
                    <div className="card p-8 text-center text-sm text-[var(--text-dim)]">No banned wallets</div>
                  ) : (
                    <div className="card overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)]">
                          <tr>
                            {['Wallet','Reason','Action'].map(h => (
                              <th key={h} className="px-4 py-3 text-left label">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(banned).map(([wallet, reason]) => (
                            <tr key={wallet} className="border-b border-[var(--border)] last:border-0">
                              <td className="px-4 py-3 font-mono text-xs text-[var(--text)]">{wallet}</td>
                              <td className="px-4 py-3 text-xs text-[var(--text-sub)]">{reason as string}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => moderateWallet('unban', wallet)}
                                  className="btn-ghost text-xs text-emerald-600 hover:bg-emerald-50">
                                  <CheckCircle size={12}/> Unban
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Flagged wallets */}
                <div>
                  <p className="label mb-4">Flagged wallets ({Object.keys(flagged).length})</p>
                  {Object.keys(flagged).length === 0 ? (
                    <div className="card p-8 text-center text-sm text-[var(--text-dim)]">No flagged wallets</div>
                  ) : (
                    <div className="card overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)]">
                          <tr>
                            {['Wallet','Reason','Actions'].map(h => (
                              <th key={h} className="px-4 py-3 text-left label">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(flagged).map(([wallet, reason]) => (
                            <tr key={wallet} className="border-b border-[var(--border)] last:border-0">
                              <td className="px-4 py-3 font-mono text-xs text-[var(--text)]">{wallet}</td>
                              <td className="px-4 py-3 text-xs text-[var(--text-sub)]">{reason as string}</td>
                              <td className="px-4 py-3 flex items-center gap-2">
                                <button
                                  onClick={() => moderateWallet('unflag', wallet)}
                                  className="btn-ghost text-xs text-emerald-600 hover:bg-emerald-50">
                                  <CheckCircle size={12}/> Clear
                                </button>
                                <button
                                  onClick={() => moderateWallet('ban', wallet, 'Escalated from flag')}
                                  className="btn-ghost text-xs text-red-500 hover:bg-red-50">
                                  <Ban size={12}/> Ban
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  )
}
