'use client'
import { useEffect, useState, useCallback } from 'react'
import { useWallet }              from '@aptos-labs/wallet-adapter-react'
import { useRouter }              from 'next/navigation'
import { Navbar }                 from '@/components/layout/Navbar'
import {
  ShieldCheck, Users, FileText, DollarSign,
  Eye, AlertTriangle, Ban, Flag, CheckCircle,
  ExternalLink, RefreshCw, Search, ChevronDown, ChevronUp, Activity,
  Sparkles, Trash2, Loader2,
} from 'lucide-react'
import { truncateAddress, formatUsdc, timeAgo, credLabel, credEmoji, daysLeft, isExpired } from '@/lib/utils'
import { getRandomSample }        from '@/lib/sampleCredentials'
import { generateCertificateFile } from '@/lib/generateCertificate'
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

  const [checking, setChecking] = useState(true)

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
  const [generating,  setGenerating]  = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (checking) return
    if (!connected) { router.push('/'); return }
    if (account?.address?.toString().toLowerCase() !== adminWallet.toLowerCase()) {
      router.push('/')
    }
  }, [checking, connected, account])

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

  useEffect(() => {
    if (!checking && connected && account) fetchAll()
  }, [checking, connected, account])

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

  const generateTestCredential = async () => {
    if (!adminWallet) { toast.error('Admin wallet not configured'); return }
    setGenerating(true)
    try {
      const sample = getRandomSample()

      const res = await fetch('/api/credential/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sample, walletAddress: adminWallet }),
      })
      if (!res.ok) throw new Error('Failed to generate credential')
      const { credential } = await res.json()

      const file = await generateCertificateFile({
        title: sample.title,
        institution: sample.institution,
        recipientName: 'Admin',
      })
      const fd = new FormData()
      fd.append('file', file)
      fd.append('credentialId', credential.id)
      fd.append('walletAddress', adminWallet)
      await fetch('/api/credential/upload-file', { method: 'POST', body: fd })

      toast.success('Test credential generated with certificate')
      fetchAll()
    } catch {
      toast.error('Failed to generate test credential')
    } finally {
      setGenerating(false)
    }
  }

  const deleteCredentialAsAdmin = async (credentialId: string) => {
    try {
      const res = await fetch('/api/admin/credential/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ credentialId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Credential deleted')
      fetchAll()
    } catch {
      toast.error('Failed to delete credential')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Navbar/>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
        </div>
      </div>
    )
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <ShieldCheck size={14} className="text-white"/>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Admin Panel</h1>
            </div>
            <p className="text-sm font-mono" style={{ color: 'var(--text-dim)' }}>{truncateAddress(account?.address?.toString() ?? '')}</p>
          </div>
          <button onClick={fetchAll} className="btn-outline text-xs h-9">
            <RefreshCw size={13}/> Refresh
          </button>
        </div>

        <div className="flex border-b mb-8 gap-0 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          {([
            { key:'overview',    label:'Overview',    icon:<Activity size={14}/> },
            { key:'profiles',    label:'Profiles',    icon:<Users size={14}/> },
            { key:'credentials', label:'Credentials', icon:<FileText size={14}/> },
            { key:'payments',    label:'Payments',    icon:<DollarSign size={14}/> },
            { key:'banned',      label:'Moderation',  icon:<Ban size={14}/> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all"
              style={{
                borderColor: tab === t.key ? 'var(--accent)' : 'transparent',
                color:       tab === t.key ? 'var(--accent)' : 'var(--text-sub)',
              }}>
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
            {tab === 'overview' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { icon:<Users size={18}/>,       label:'Total Profiles',    value: stats.totalProfiles },
                    { icon:<FileText size={18}/>,    label:'Total Credentials', value: stats.totalCredentials },
                    { icon:<DollarSign size={18}/>,  label:'Total Payments',    value: stats.totalPayments },
                    { icon:<Activity size={18}/>,    label:'Active Access',     value: stats.activeAccess },
                    { icon:<DollarSign size={18}/>,  label:'Platform Earned',   value: formatUsdc(stats.platformEarnings) },
                  ].map(s => (
                    <div key={s.label} className="card p-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--bg-subtle)', color: 'var(--accent)' }}>
                        {s.icon}
                      </div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-sub)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>Recent profiles</p>
                  <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                          {['Wallet','Name','Credentials','Mode','Status','Joined'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profiles.slice(0, 8).map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-dim)' }}>{truncateAddress(p.walletAddress)}</td>
                            <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>
                              {p.displayName}
                              {p.walletAddress?.toLowerCase() === adminWallet.toLowerCase() && (
                                <span className="badge-pink text-[9px] ml-2">Admin</span>
                              )}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-sub)' }}>{p.credentials.length}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                                background: p.accessMode === 'paid' ? 'var(--accent-pale)' : '#ecfdf5',
                                color:      p.accessMode === 'paid' ? 'var(--accent)' : '#047857',
                              }}>
                                {p.accessMode === 'paid' ? `$${p.accessFeeUsdc}` : 'Free'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {p.isBanned ? <span className="text-xs text-red-500 font-medium">Banned</span>
                              : p.isFlagged ? <span className="text-xs text-amber-500 font-medium">Flagged</span>
                              : <span className="text-xs text-emerald-600 font-medium">Active</span>}
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-dim)' }}>{timeAgo(p.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'profiles' && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }}/>
                    <input className="input pl-9" placeholder="Search name or wallet…" value={query} onChange={e => setQuery(e.target.value)}/>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{filteredProfiles.length} profiles</p>
                </div>

                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        {['Profile','Credentials','Verified','Access Mode','Earnings','Status','Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map(p => {
                        const verifiedCount = p.credentials.filter(c => c.verificationStatus === 'verified').length
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-pale)' }}>
                                  <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{p.displayName?.[0]?.toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="font-semibold" style={{ color: 'var(--text)' }}>
                                    {p.displayName}
                                    {p.walletAddress?.toLowerCase() === adminWallet.toLowerCase() && (
                                      <span className="badge-pink text-[9px] ml-2">Admin</span>
                                    )}
                                  </p>
                                  <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{truncateAddress(p.walletAddress)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-sub)' }}>{p.credentials.length}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <ShieldCheck size={11}/>{verifiedCount}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                                background: p.accessMode === 'paid' ? 'var(--accent-pale)' : '#ecfdf5',
                                color:      p.accessMode === 'paid' ? 'var(--accent)' : '#047857',
                              }}>
                                {p.accessMode === 'paid' ? `$${p.accessFeeUsdc} USDC` : 'Free'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                              {formatUsdc(p.totalEarnings ?? 0)}
                            </td>
                            <td className="px-4 py-3">
                              {p.isBanned ? <span className="text-xs text-red-500 font-medium flex items-center gap-1"><Ban size={10}/>Banned</span>
                              : p.isFlagged ? <span className="text-xs text-amber-500 font-medium flex items-center gap-1"><Flag size={10}/>Flagged</span>
                              : <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle size={10}/>Active</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <a href={`/profile/${p.walletAddress}`} target="_blank" rel="noopener noreferrer" className="btn-icon w-7 h-7">
                                  <ExternalLink size={12}/>
                                </a>
                                {p.isBanned ? (
                                  <button onClick={() => moderateWallet('unban', p.walletAddress)} className="btn-icon w-7 h-7 text-emerald-600">
                                    <CheckCircle size={12}/>
                                  </button>
                                ) : (
                                  <>
                                    {!p.isFlagged && (
                                      <button onClick={() => moderateWallet('flag', p.walletAddress, 'Flagged by admin')} className="btn-icon w-7 h-7 text-amber-500">
                                        <Flag size={12}/>
                                      </button>
                                    )}
                                    <button onClick={() => moderateWallet('ban', p.walletAddress, 'Banned by admin')} className="btn-icon w-7 h-7 text-red-500">
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
                    <div className="p-10 text-center text-sm" style={{ color: 'var(--text-dim)' }}>No profiles found</div>
                  )}
                </div>
              </div>
            )}

            {tab === 'credentials' && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }}/>
                    <input className="input pl-9" placeholder="Search title, institution or wallet…" value={query} onChange={e => setQuery(e.target.value)}/>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{filteredCreds.length} credentials</p>
                  <button onClick={generateTestCredential} disabled={generating} className="btn-primary text-xs h-9 ml-auto">
                    {generating
                      ? <><Loader2 size={13} className="animate-spin"/>Generating…</>
                      : <><Sparkles size={13}/>Generate test credential</>
                    }
                  </button>
                </div>

                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        {['Credential','Owner','Type','Status','Submitted','Blob ID','Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCreds.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{credEmoji(c.type)}</span>
                              <div>
                                <p className="font-semibold" style={{ color: 'var(--text)' }}>{c.title}</p>
                                <p className="text-xs" style={{ color: 'var(--text-sub)' }}>{c.institution}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
                            {truncateAddress(c.ownerWallet)}
                            {c.ownerWallet?.toLowerCase() === adminWallet.toLowerCase() && (
                              <span className="badge-pink text-[9px] ml-1.5">Admin</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs capitalize" style={{ color: 'var(--text-sub)' }}>{credLabel(c.type)}</td>
                          <td className="px-4 py-3">
                            {c.verificationStatus === 'verified' && <span className="badge-verified text-[10px]"><ShieldCheck size={9}/>Verified</span>}
                            {(c.verificationStatus === 'pending' || c.verificationStatus === 'reviewing') && <span className="badge-pending text-[10px]">Pending</span>}
                            {c.verificationStatus === 'failed' && <span className="badge-failed text-[10px]">Failed</span>}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-dim)' }}>{timeAgo(c.createdAt)}</td>
                          <td className="px-4 py-3 font-mono text-xs max-w-[120px] truncate" style={{ color: 'var(--text-dim)' }}>{c.blobId || '—'}</td>
                          <td className="px-4 py-3">
                            {c.ownerWallet?.toLowerCase() === adminWallet.toLowerCase() && (
                              <button onClick={() => deleteCredentialAsAdmin(c.id)} className="btn-icon w-7 h-7 text-red-500">
                                <Trash2 size={12}/>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCreds.length === 0 && (
                    <div className="p-10 text-center text-sm" style={{ color: 'var(--text-dim)' }}>No credentials found</div>
                  )}
                </div>
              </div>
            )}

            {tab === 'payments' && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }}/>
                    <input className="input pl-9" placeholder="Search by wallet…" value={query} onChange={e => setQuery(e.target.value)}/>
                  </div>
                  <div className="card px-4 py-2">
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Platform total</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                      {formatUsdc(filteredPay.reduce((s, p) => s + p.platformCut, 0))}
                    </p>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        {['Viewer','Profile Owner','Amount','Your Cut (20%)','Status','Date','Tx'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPay.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-dim)' }}>{truncateAddress(p.viewerWallet)}</td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-dim)' }}>{truncateAddress((p as AdminPayment & { ownerWallet?: string }).ownerWallet ?? '')}</td>
                          <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text)' }}>{formatUsdc(p.amountUsdc)}</td>
                          <td className="px-4 py-3 font-bold" style={{ color: 'var(--accent)' }}>{formatUsdc(p.platformCut)}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                              background: p.isActive ? '#ecfdf5' : 'var(--bg-subtle)',
                              color:      p.isActive ? '#047857' : 'var(--text-dim)',
                            }}>
                              {p.isActive ? `${daysLeft(p.expiresAt)}d left` : 'Expired'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-dim)' }}>{timeAgo(p.paidAt)}</td>
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
                    <div className="p-10 text-center text-sm" style={{ color: 'var(--text-dim)' }}>No payments yet</div>
                  )}
                </div>
              </div>
            )}

            {tab === 'banned' && (
              <div className="space-y-8">
                <div className="card p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>Manual moderation</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input className="input flex-1" placeholder="Wallet address to ban or flag…" value={banTarget} onChange={e => setBanTarget(e.target.value)}/>
                    <input className="input flex-1" placeholder="Reason (optional)" value={banReason} onChange={e => setBanReason(e.target.value)}/>
                    <div className="flex gap-2">
                      <button onClick={() => { if (banTarget) { moderateWallet('flag', banTarget, banReason); setBanTarget(''); setBanReason('') }}}
                        className="btn-outline text-sm whitespace-nowrap" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                        <Flag size={13}/> Flag
                      </button>
                      <button onClick={() => { if (banTarget) { moderateWallet('ban', banTarget, banReason); setBanTarget(''); setBanReason('') }}}
                        className="btn-primary text-sm whitespace-nowrap" style={{ background: '#ef4444' }}>
                        <Ban size={13}/> Ban
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>Banned wallets ({Object.keys(banned).length})</p>
                  {Object.keys(banned).length === 0 ? (
                    <div className="card p-8 text-center text-sm" style={{ color: 'var(--text-dim)' }}>No banned wallets</div>
                  ) : (
                    <div className="card overflow-hidden">
                      <table className="w-full text-sm">
                        <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                          <tr>{['Wallet','Reason','Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {Object.entries(banned).map(([wallet, reason]) => (
                            <tr key={wallet} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text)' }}>{wallet}</td>
                              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-sub)' }}>{reason as string}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => moderateWallet('unban', wallet)} className="btn-ghost text-xs text-emerald-600">
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

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>Flagged wallets ({Object.keys(flagged).length})</p>
                  {Object.keys(flagged).length === 0 ? (
                    <div className="card p-8 text-center text-sm" style={{ color: 'var(--text-dim)' }}>No flagged wallets</div>
                  ) : (
                    <div className="card overflow-hidden">
                      <table className="w-full text-sm">
                        <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                          <tr>{['Wallet','Reason','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {Object.entries(flagged).map(([wallet, reason]) => (
                            <tr key={wallet} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text)' }}>{wallet}</td>
                              <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-sub)' }}>{reason as string}</td>
                              <td className="px-4 py-3 flex items-center gap-2">
                                <button onClick={() => moderateWallet('unflag', wallet)} className="btn-ghost text-xs text-emerald-600">
                                  <CheckCircle size={12}/> Clear
                                </button>
                                <button onClick={() => moderateWallet('ban', wallet, 'Escalated from flag')} className="btn-ghost text-xs text-red-500">
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
