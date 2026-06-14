'use client'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search, ShieldCheck, Clock, DollarSign, History, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForCompanies() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">

        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10" style={{ color: 'var(--text-sub)' }}>
          <ArrowLeft size={14}/> Back to home
        </Link>

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>For companies</p>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>Verify candidates instantly without phone calls or agencies</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-sub)' }}>
            When a candidate applies with a Profilr link, every credential on their profile has already been verified by GenLayer AI consensus before you see it. There is nothing to manually check. The proof is already on-chain.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {[
            {
              icon: <Search size={18}/>,
              title: 'Receive a Profilr link in any application',
              body: 'The candidate pastes their Profilr link in their CV, email, or application form. You click it and land on their public profile page. Free profiles show everything immediately. Paid profiles show the candidate name, title, and credential count. You unlock the full details by paying a small USDC fee set by the candidate.',
            },
            {
              icon: <ShieldCheck size={18}/>,
              title: 'Every credential is pre-verified by AI',
              body: 'You are not reading a self-reported CV. Every credential on the profile was submitted by the candidate and then verified by five independent GenLayer AI validators before the badge was issued. The validators checked the institution exists, the credential is plausible, and there are no red flags. The verdict and reasoning are stored permanently on-chain.',
            },
            {
              icon: <DollarSign size={18}/>,
              title: 'Pay only when you want full access',
              body: 'If the candidate has set a paid profile, you pay a small USDC amount typically between $2 and $10 as set by the candidate. This unlocks their full credential history for 7 days. The payment is processed on Aptos testnet, enforced by a GenLayer smart contract, and recorded on Shelby.',
            },
            {
              icon: <Clock size={18}/>,
              title: '7-day access window',
              body: 'Access to a paid profile lasts exactly 7 days from payment. After that, if you want to re-verify the candidate for a second interview or background check, you pay again. This ensures credentials are re-checked against the current on-chain state rather than a cached version.',
            },
            {
              icon: <History size={18}/>,
              title: 'Full payment history in your dashboard',
              body: 'Every profile you have paid to access is recorded in your company history on Shelby. You can see who you accessed, when, and when access expires. If you need to re-check a candidate, click their name in your history and you go straight to the payment page without searching.',
            },
          ].map((s, i) => (
            <div key={i} className="card p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}>
                {s.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 mb-8">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>What Profilr verification replaces</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { old: 'Calling universities to verify degrees',  issue: 'Takes days and is often ignored' },
              { old: 'Phoning previous employers',              issue: 'Slow and unreliable' },
              { old: 'Paying a background check agency',        issue: 'Expensive with weeks of waiting' },
              { old: 'Reading a self-reported LinkedIn',        issue: 'No verification at all' },
            ].map((r, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-2">
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0 text-amber-500"/>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{r.old}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{r.issue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }}/>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
              Profilr replaces all of the above with a single link click and a small USDC payment. Instant, permanent and on-chain.
            </p>
          </div>
        </div>

        <Link href="/explore" className="btn-primary inline-flex">
          Browse verified candidates <ArrowRight size={15}/>
        </Link>
      </div>
    </div>
  )
}
