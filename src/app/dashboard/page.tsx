'use client'
import { useEffect, useState }   from 'react'
import { useWallet }              from '@aptos-labs/wallet-adapter-react'
import { useRouter }              from 'next/navigation'
import { Navbar }                 from '@/components/layout/Navbar'
import { CredentialCard }         from '@/components/profile/CredentialCard'
import { AddCredentialModal }     from '@/components/profile/AddCredentialModal'
import { ProfileSetupModal }      from '@/components/profile/ProfileSetupModal'
import { AccessHistoryPanel }     from '@/components/profile/AccessHistoryPanel'
import { EarningsPanel }          from '@/components/profile/EarningsPanel'
import { Plus, Link2, Copy, Check, Settings, ShieldCheck, Eye, DollarSign, Wallet2 } from 'lucide-react'
import type { ProfilrProfile }    from '@/types'
import toast                      from 'react-hot-toast'
import { truncateAddress, formatUsdc } from '@/lib/utils'

type Tab = 'credentials' | 'access' | 'earnings'

export default function Dashboard() {
  const { connected, account } = useWallet()
  const router                 = useRouter()
  const [profile, setProfile]  = useState<ProfilrProfile | null>(null)
  const [loading, setLoading]  = useState(true)
  const [tab, setTab]          = useState<Tab>('credentials')
  const [showAdd, setShowAdd]  = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [copied, setCopied]    = useState(false)

  useEffect(() => {
    if (!connected) { router.push('/'); return }
    fetchProfile()
  }, [connected, account])

  const fetchProfile = async () => {
    if (!account?.address) return
    setLoading(true)
    try {
      const res = await fetch(`/api/profile/${account.address}`)
      if (res.ok)           setProfile((await res.json()).profile)
      else if (res.status === 404) setShowSetup(true)
    } catch { toast.error('Failed to load profile') }
    finally   { setLoading(false) }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/profile/${account?.address}`)
    setCopied(true); toast.success('Profile link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!connected) return null

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar/>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
      </div>
    </div>
  )

  const verifiedCount = profile?.credentials.filter(c => c.verificationStatus === 'verified').length ?? 0

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar/>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              {profile?.displayName || 'Your Profile'}
            </h1>
            <p className="text-sm text-[var(--text-dim)] font-mono mt-1">
              {truncateAddress(account?.address?.toString() ?? '')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="btn-outline text-xs h-9 px-4">
              {copied ? <Check size={13}/> : <Link2 size={13}/>}
              Copy profile link
            </button>
            <button onClick={() => setShowSetup(true)} className="btn-icon">
              <Settings size={15}/>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 stagger">
          {[
            { icon:<ShieldCheck size={15}/>, label:'Verified', value: verifiedCount },
            { icon:<Eye size={15}/>,         label:'Total Views', value: profile?.totalViews ?? 0 },
            { icon:<DollarSign size={15}/>,  label:'Earned', value: formatUsdc(profile?.totalEarnings ?? 0) },
            { icon:<Wallet2 size={15}/>,     label:'Access Mode', value: profile?.accessMode === 'paid' ? `$${profile.accessFeeUsdc} USDC` : 'Free' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className="flex items-center gap-1.5 text-[var(--text-dim)] mb-2">
                {s.icon}<span className="text-xs">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-[var(--text)]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] mb-6 gap-0">
          {(['credentials','access','earnings'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-all ${
                tab === t
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-sub)] hover:text-[var(--text)]'
              }`}>
              {t === 'access' ? 'Access History' : t === 'earnings' ? 'Earnings' : 'Credentials'}
            </button>
          ))}
        </div>

        {tab === 'credentials' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-[var(--text-sub)]">
                {profile?.credentials.length ?? 0} credentials on Shelby · {verifiedCount} verified
              </p>
              <button onClick={() => setShowAdd(true)} className="btn-primary text-xs h-9">
                <Plus size={13}/> Add credential
              </button>
            </div>
            {!profile?.credentials.length ? (
              <div className="card p-14 text-center">
                <ShieldCheck size={36} className="text-[var(--border)] mx-auto mb-3"/>
                <p className="text-sm text-[var(--text-sub)] mb-4">No credentials yet</p>
                <button onClick={() => setShowAdd(true)} className="btn-primary text-sm mx-auto">
                  <Plus size={13}/> Add your first credential
                </button>
              </div>
            ) : (
              <div className="space-y-3 stagger">
                {profile.credentials.map(c => (
                  <CredentialCard key={c.id} credential={c} onRefresh={fetchProfile}/>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'access'    && <AccessHistoryPanel walletAddress={account?.address?.toString() ?? ''}/>}
        {tab === 'earnings'  && <EarningsPanel walletAddress={account?.address?.toString() ?? ''} profile={profile}/>}
      </div>

      {showAdd   && <AddCredentialModal walletAddress={account?.address?.toString() ?? ''} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchProfile() }}/>}
      {showSetup && <ProfileSetupModal  profile={profile} walletAddress={account?.address?.toString() ?? ''} onClose={() => setShowSetup(false)} onSuccess={p => { setShowSetup(false); setProfile(p) }}/>}
    </div>
  )
}
