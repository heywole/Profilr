'use client'
import { useEffect, useState } from 'react'
import { Navbar }               from '@/components/layout/Navbar'
import Link                     from 'next/link'
import { ShieldCheck, Search, MapPin, Lock, Globe2 } from 'lucide-react'
import type { ProfilrProfile }  from '@/types'
import toast                    from 'react-hot-toast'

export default function Explore() {
  const [profiles, setProfiles] = useState<ProfilrProfile[]>([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile/list')
      if (!res.ok) throw new Error()
      setProfiles((await res.json()).profiles ?? [])
    } catch { toast.error('Failed to load profiles') }
    finally { setLoading(false) }
  }

  const filtered = profiles.filter(p =>
    !query ||
    p.displayName.toLowerCase().includes(query.toLowerCase()) ||
    p.title?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar/>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="label mb-2">Explore</p>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-4">Verified profiles</h1>
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"/>
            <input
              className="input pl-10"
              placeholder="Search by name or title…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-14 text-center">
            <Globe2 size={32} className="text-[var(--border)] mx-auto mb-3"/>
            <p className="text-sm font-semibold text-[var(--text-sub)]">No profiles yet</p>
            <p className="text-xs text-[var(--text-dim)] mt-1">Be the first to create a verified profile</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {filtered.map(p => {
              const verified = p.credentials.filter(c => c.verificationStatus === 'verified').length
              return (
                <Link key={p.id} href={`/profile/${p.walletAddress}`} className="card-hover p-5 block">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--accent-pale)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[var(--accent)] font-bold text-lg">
                        {p.displayName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--text)] truncate">{p.displayName}</p>
                      {p.title && <p className="text-xs text-[var(--text-sub)] truncate mt-0.5">{p.title}</p>}
                    </div>
                    {p.accessMode === 'paid'
                      ? <Lock size={13} className="text-[var(--accent)] flex-shrink-0"/>
                      : <Globe2 size={13} className="text-emerald-500 flex-shrink-0"/>
                    }
                  </div>

                  {p.location && (
                    <p className="text-xs text-[var(--text-dim)] flex items-center gap-1 mb-3">
                      <MapPin size={10}/>{p.location}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-emerald-500"/>
                      <span className="text-xs text-[var(--text-sub)]">{verified} verified</span>
                    </div>
                    {p.accessMode === 'paid'
                      ? <span className="badge-pink text-[10px]">${p.accessFeeUsdc} USDC</span>
                      : <span className="text-xs text-emerald-600 font-medium">Free</span>
                    }
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
