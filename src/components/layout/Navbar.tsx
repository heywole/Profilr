'use client'
import Link            from 'next/link'
import { useTheme }    from 'next-themes'
import { usePathname } from 'next/navigation'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn }          from '@/lib/utils'
import { WalletButton } from '@/components/wallet/WalletButton'

const HOW_IT_WORKS = [
  { href: '/how-it-works/candidates', label: 'For candidates',    desc: 'Build your verified profile' },
  { href: '/how-it-works/companies',  label: 'For companies',     desc: 'Verify talent instantly'     },
  { href: '/how-it-works/shelby',     label: 'How Shelby works',  desc: 'Decentralized storage'       },
  { href: '/how-it-works/genlayer',   label: 'How GenLayer works',desc: 'AI consensus verification'  },
]

function ProfilrLogo({ size = 32 }: { size?: number }) {
  const r = size / 150
  return (
    <svg width={size} height={size} viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" rx="26" fill="#E91E8C"/>
      <text x="5" y="142" fontSize="138" fontFamily="Georgia,'Times New Roman',serif" fontWeight="700" fill="white">P</text>
      {/* eye in bowl */}
      <circle cx="70" cy="68" r="20" fill="white"/>
      <circle cx="70" cy="68" r="11" fill="#E91E8C"/>
      <circle cx="70" cy="74" r="5" fill="white"/>
      {/* eye on stem */}
      <circle cx="108" cy="68" r="9" fill="white"/>
      <circle cx="108" cy="68" r="4.5" fill="#E91E8C"/>
      <circle cx="110" cy="66" r="1.8" fill="white"/>
    </svg>
  )
}

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const pathname            = usePathname()
  const [howOpen, setHowOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setHowOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <ProfilrLogo size={32}/>
          <span className="font-semibold tracking-tight text-base" style={{ color: 'var(--text)' }}>Profilr</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1">

          {/* How it works dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setHowOpen(v => !v)}
              className={cn(
                'flex items-center gap-1 text-sm font-medium transition-colors',
                howOpen ? '' : ''
              )}
              style={{ color: howOpen ? 'var(--accent)' : 'var(--text-sub)' }}
            >
              How it works
              <ChevronDown size={13} className={cn('transition-transform duration-200', howOpen && 'rotate-180')}/>
            </button>

            {howOpen && (
              <div className="absolute top-9 left-0 w-56 card py-1.5 z-50"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', animation: 'fadeIn 0.15s ease' }}>
                {HOW_IT_WORKS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setHowOpen(false)}
                    className="block px-4 py-2.5 transition-colors"
                    style={{}}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{item.desc}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/explore"
            className="text-sm font-medium transition-colors"
            style={{ color: pathname === '/explore' ? 'var(--accent)' : 'var(--text-sub)' }}>
            Explore
          </Link>

          <Link href="/dashboard"
            className="text-sm font-medium transition-colors"
            style={{ color: pathname === '/dashboard' ? 'var(--accent)' : 'var(--text-sub)' }}>
            Dashboard
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-icon"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun  size={15} style={{ color: 'var(--text-dim)' }}/>
              : <Moon size={15} style={{ color: 'var(--text-dim)' }}/>
            }
          </button>
          <WalletButton/>
        </div>
      </div>
    </header>
  )
}
