'use client'
import { useEffect, useState }   from 'react'
import { useParams }              from 'next/navigation'
import { useWallet }              from '@aptos-labs/wallet-adapter-react'
import { Navbar }                 from '@/components/layout/Navbar'
import { CredentialCard }         from '@/components/profile/CredentialCard'
import { PayAccessModal }         from '@/components/profile/PayAccessModal'
import { ShieldCheck, Lock, Clock, MapPin, Globe, ExternalLink, Eye, Share2 } from 'lucide-react'
import type { ProfilrProfile }    from '@/types'
import { daysLeft, fmtDateFull, truncateAddress } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { address }              = useParams() as { address: string }
  const { account, connected }   = useWallet()
  const [profile, setProfile]    = useState<ProfilrProfile | null>(null)
  const [loading, setLoading]    = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [showPay, setShowPay]    = useState(false)
  const [copied, setCopied]      = useState(false)
  const isOwner = account?.address?.toString() === address

  useEffect(() => { fetchProfile() }, [address])
  useEffect(() => {
    if (connected && account && profile?.accessMode === 'paid' && !isOwner) checkAccess()
  }, [connected, account, profile])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/profile/${address}`)
      if (!res.ok) throw new Error()
      setProfile((await res.json()).profile)
    } catch { toast.error('Profile not found') }
    finally { setLoading(false) }
  }

  const checkAccess = async () => {
    if (!account?.address || !profile?.profileBlobId) return
    const res = await fetch(`/api/access/check?profileBlobId=${profile.profileBlobId}&viewer=${account.address}`)
    const d   = await res.json()
    setHasAccess(d.hasAccess); setExpiresAt(d.expiresAt)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true); toast.success('Link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  const canView = isOwner || profile?.accessMode === 'free' || hasAccess
  const verifiedCount = profile?.credentials.filter(c => c.verificationStatus === 'verified').length ?? 0

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg)]"><Navbar/>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-[var(--bg)]"><Navbar/>
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-lg font-semibold text-[var(--text)]">Profile not found</p>
        <p className="text-sm text-[var(--text-sub)]">This wallet hasn&apos;t created a Profilr profile yet.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar/>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">

        {/* Profile header card */}
        <div className="card p-6 mb-5 animate-fade-up">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-pale)] flex items-center justify-center flex-shrink-0 shadow-shelby">
              <span className="text-[var(--accent)] font-bold text-2xl">
                {profile.displayName?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-[var(--text)]">{profile.displayName}</h1>
                  {profile.title && <p className="text-sm text-[var(--text-sub)] mt-0.5">{profile.title}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyLink} className="btn-icon" title="Copy link">
                    <Share2 size={14}/>
                  </button>
                  {/* Access badge */}
                  {profile.accessMode === 'paid' && !isOwner && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      hasAccess
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-[var(--accent-pale)] text-[var(--accent)] border-[var(--accent)]/20'
                    }`}>
                      {hasAccess
                        ? <><Eye size={11}/>{daysLeft(expiresAt!)}d access left</>
                        : <><Lock size={11}/>Paid · ${profile.accessFeeUsdc} USDC</>
                      }
                    </div>
                  )}
                  {isOwner && <span className="badge-pink text-xs">Your profile</span>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--text-dim)]">
                {profile.location && <span className="flex items-center gap-1"><MapPin size={11}/>{profile.location}</span>}
                {profile.website  && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
                    <Globe size={11}/> Website <ExternalLink size={9}/>
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-600"/>
                  {verifiedCount} verified credential{verifiedCount !== 1 ? 's' : ''}
                </span>
                <span className="font-mono">{truncateAddress(address)}</span>
              </div>

              {profile.bio && canView && (
                <p className="text-sm text-[var(--text-sub)] mt-3 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pay gate */}
        {profile.accessMode === 'paid' && !canView && (
          <div className="card p-10 text-center mb-5 animate-fade-up" style={{ border: '1.5px solid rgba(233,30,140,0.15)' }}>
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-pale)] flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-[var(--accent)]"/>
            </div>
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">Credentials locked</h2>
            <p className="text-sm text-[var(--text-sub)] mb-7 max-w-xs mx-auto leading-relaxed">
              Pay ${profile.accessFeeUsdc} USDC to view {profile.displayName}&apos;s full
              verified credential history for 7 days.
            </p>
            <button
              onClick={() => connected ? setShowPay(true) : toast.error('Connect your wallet first')}
              className="btn-primary mx-auto px-7 py-3">
              <Lock size={14}/> Unlock for ${profile.accessFeeUsdc} USDC
            </button>
            <p className="text-xs text-[var(--text-dim)] mt-4 flex items-center justify-center gap-1.5">
              <Clock size={11}/> 7-day access · No downloads · Pay again to re-verify
            </p>
          </div>
        )}

        {/* Credentials */}
        {canView ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="label">Credentials</p>
              <span className="text-xs text-[var(--text-dim)]">
                {profile.credentials.length} total · {verifiedCount} verified
              </span>
            </div>
            {profile.credentials.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-sm text-[var(--text-sub)]">No credentials added yet</p>
              </div>
            ) : (
              <div className="space-y-3 stagger">
                {profile.credentials.map(c => (
                  <CredentialCard key={c.id} credential={c} readOnly/>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card p-6 text-center opacity-60">
            <p className="text-sm text-[var(--text-sub)]">
              {profile.credentials.length} credential{profile.credentials.length !== 1 ? 's' : ''} hidden — unlock to view
            </p>
          </div>
        )}

        {/* Attribution */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--text-dim)]">
          <span>Stored on</span>
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>Shelby Protocol</span>
          <span>·</span>
          <span>Verified by</span>
          <span className="font-semibold text-purple-600">GenLayer</span>
        </div>
      </div>

      {showPay && (
        <PayAccessModal
          profile={profile}
          viewerWallet={account?.address?.toString() ?? ''}
          onClose={() => setShowPay(false)}
          onSuccess={() => { setShowPay(false); checkAccess() }}
        />
      )}
    </div>
  )
}
