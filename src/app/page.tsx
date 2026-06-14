import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import {
  ArrowRight, ShieldCheck, Link2, Lock,
  Building2, GraduationCap, Award, Briefcase,
  CheckCircle, Clock, Globe
} from 'lucide-react'

function ProfilrMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" rx="26" fill="#E91E8C"/>
      <text x="5" y="142" fontSize="138" fontFamily="Georgia,'Times New Roman',serif" fontWeight="700" fill="white">P</text>
      <circle cx="70" cy="68" r="20" fill="white"/>
      <circle cx="70" cy="68" r="11" fill="#E91E8C"/>
      <circle cx="70" cy="74" r="5" fill="white"/>
      <circle cx="108" cy="68" r="9" fill="white"/>
      <circle cx="108" cy="68" r="4.5" fill="#E91E8C"/>
      <circle cx="110" cy="66" r="1.8" fill="white"/>
    </svg>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>

      {/* ── HERO ── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-7"
              style={{ background: 'var(--accent-pale)', color: 'var(--accent)', border: '1px solid rgba(233,30,140,0.15)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }}/>
              Testnet — Built on Shelby Protocol
            </div>

            <h1
              className="text-4xl sm:text-[2.75rem] font-bold tracking-tight leading-[1.1] mb-5"
              style={{ color: 'var(--text)' }}
            >
              Professional credentials that speak for themselves
            </h1>

            <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-sub)', maxWidth: '420px' }}>
              Store your qualifications on Shelby Protocol. Every credential is verified by GenLayer AI consensus. Share a single link with employers and choose your own access terms.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/dashboard" className="btn-primary px-6">
                Create your profile <ArrowRight size={15}/>
              </Link>
              <Link href="/explore" className="btn-outline px-6">
                Browse verified profiles
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              {[
                { icon: <ShieldCheck size={16}/>, label: 'AI verified',         sub: 'by GenLayer' },
                { icon: <Lock size={16}/>,        label: 'Access controlled',   sub: 'by you' },
                { icon: <Globe size={16}/>,       label: 'Stored on-chain',     sub: 'on Shelby' },
              ].map(item => (
                <div key={item.label}>
                  <div className="mb-1.5" style={{ color: 'var(--accent)' }}>{item.icon}</div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — profile card */}
          <div>
            <div
              className="card p-6"
              style={{ boxShadow: '0 4px 32px rgba(233,30,140,0.08), 0 1px 4px rgba(0,0,0,0.06)' }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                  style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}
                >
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Adaeze Okonkwo</p>
                    <span className="badge-verified text-[10px]">
                      <ShieldCheck size={9}/> Profile verified
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>Senior Software Engineer · Lagos</p>
                  <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-dim)' }}>shelby://0x8f3a…e2d1</p>
                </div>
                <span className="badge-pink text-[10px] flex-shrink-0">Paid · $3</span>
              </div>

              {/* Credentials */}
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>
                Verified credentials
              </p>
              <div className="space-y-0">
                {[
                  { icon: <GraduationCap size={14}/>, title: 'BSc Computer Science',       sub: 'University of Lagos · 2019' },
                  { icon: <Briefcase size={14}/>,     title: 'Software Engineer',           sub: 'Andela · 2020 — 2023' },
                  { icon: <Award size={14}/>,         title: 'AWS Solutions Architect',     sub: 'Amazon Web Services · 2022' },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3"
                    style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--accent)' }}
                    >
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{c.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{c.sub}</p>
                    </div>
                    <CheckCircle size={14} style={{ color: '#16a34a', flexShrink: 0 }}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ borderTop: '1px solid var(--border)' }}/>

      {/* ── STATS ── */}
      <section style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { label: 'Profiles on Shelby',    value: '—', icon: <Building2 size={16}/> },
              { label: 'Credentials verified',  value: '—', icon: <ShieldCheck size={16}/> },
              { label: 'Companies accessed',    value: '—', icon: <Briefcase size={16}/> },
              { label: 'USDC earned by owners', value: '—', icon: <Award size={16}/> },
            ].map(s => (
              <div key={s.label} className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── 3 columns ── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            How Profilr works
          </p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            From upload to verified in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              icon: <GraduationCap size={20}/>,
              title: 'Upload your credentials',
              body: 'Add your education history, work experience, certifications and projects. Each entry is stored as an immutable blob on Shelby Protocol with a Merkle root proof.',
            },
            {
              step: '02',
              icon: <ShieldCheck size={20}/>,
              title: 'GenLayer AI verifies',
              body: 'Five independent AI validators cross-reference your claims against public records and institutional databases. Verified credentials receive a permanent on-chain badge.',
            },
            {
              step: '03',
              icon: <Link2 size={20}/>,
              title: 'Share your verified link',
              body: 'Paste your Profilr link in any job application. You decide whether access is free or paid. Every payment goes 70% to you, recorded permanently on Shelby.',
            },
          ].map(s => (
            <div key={s.step} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}
                >
                  {s.icon}
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: 'var(--border)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.step}
                </span>
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACCESS MODEL ── */}
      <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                Access model
              </p>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                You set the terms
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-sub)' }}>
                Set your profile to free for open job applications, or charge companies a USDC fee to view your verified credentials. Access expires after 7 days — they pay again to re-verify. No downloads ever.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: <CheckCircle size={14}/>, text: '70% of every access fee paid to your wallet' },
                  { icon: <Clock size={14}/>,       text: 'Access expires after 7 days automatically' },
                  { icon: <Lock size={14}/>,        text: 'View only — no downloads protects your income' },
                  { icon: <Globe size={14}/>,       text: 'Full access history stored on Shelby forever' },
                ].map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-sub)' }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }}>{pt.icon}</span>
                    {pt.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>
                Revenue breakdown
              </p>
              {[
                { who: 'Profile owner',  pct: 70, color: 'var(--accent)' },
                { who: 'Platform',       pct: 20, color: 'var(--text-dim)' },
                { who: 'GenLayer fee',   pct: 10, color: 'var(--accent-light)' },
              ].map(r => (
                <div key={r.who} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span style={{ color: 'var(--text-sub)' }}>{r.who}</span>
                    <span className="font-bold" style={{ color: r.color }}>{r.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.pct}%`, background: r.color }}
                    />
                  </div>
                </div>
              ))}
              <div
                className="rounded-xl p-4 mt-5"
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>
                  Example on a $5 USDC access fee
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                  $3.50 <span className="text-sm font-normal" style={{ color: 'var(--text-sub)' }}>goes to you</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILT ON ── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
            Built on
          </p>
          {[
            { name: 'Shelby Protocol', color: '#E91E8C',  sub: 'Storage' },
            { name: 'GenLayer',        color: '#7C3AED',  sub: 'AI Consensus' },
            { name: 'Aptos',           color: '#2563EB',  sub: 'L1 Blockchain' },
            { name: 'USDC',            color: '#059669',  sub: 'Payments' },
          ].map(b => (
            <div key={b.name} className="text-center">
              <p className="text-sm font-bold" style={{ color: b.color }}>{b.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{b.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-4 sm:mx-6 mb-12">
        <div
          className="mx-auto max-w-5xl rounded-2xl px-8 py-12 text-center"
          style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(233,30,140,0.25)' }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">
            Start building your verified profile today
          </h2>
          <p className="text-white mb-7 text-sm" style={{ opacity: 0.85, maxWidth: '400px', margin: '0 auto 28px' }}>
            Connect your wallet and create a permanent, AI-verified professional identity in minutes.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'white', color: 'var(--accent)' }}
          >
            Get started free <ArrowRight size={15}/>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <ProfilrMark size={22}/>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Profilr</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}
            >
              Testnet
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            © 2025 Profilr · Verified credentials on Shelby Protocol
          </p>
        </div>
      </footer>
    </div>
  )
}
