'use client'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Upload, ShieldCheck, Link2, DollarSign, Lock, Clock, CheckCircle } from 'lucide-react'

export default function ForCandidates() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">

        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10" style={{ color: 'var(--text-sub)' }}>
          <ArrowLeft size={14}/> Back to home
        </Link>

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>For candidates</p>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>Build a profile employers can trust</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-sub)' }}>
            Profilr gives professionals a permanent, tamper-proof career identity. Your credentials live on Shelby Protocol where no company can alter or delete them. Every claim is independently verified by GenLayer AI validators before it goes public.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {[
            {
              icon: <Upload size={18}/>,
              title: 'Upload your credentials',
              body: 'Add your degrees, work history, certifications and completed projects. You control what is visible. Each entry is stored as an immutable blob on Shelby with a cryptographic Merkle root that proves the content has never been changed.',
            },
            {
              icon: <ShieldCheck size={18}/>,
              title: 'AI verification by GenLayer',
              body: 'After you submit a credential, five independent AI validators on the GenLayer network read your entry and cross-reference it against public institutional records. They vote independently. If a supermajority agrees the claim is legitimate, it receives a verified badge stored permanently on-chain.',
            },
            {
              icon: <Link2 size={18}/>,
              title: 'Share one link anywhere',
              body: 'Your Profilr link works everywhere. Paste it into a job application, email, LinkedIn message or WhatsApp. The person who receives it sees your verified credentials directly. No CV attachment, no PDF, no form to fill out.',
            },
            {
              icon: <Lock size={18}/>,
              title: 'You control access',
              body: 'Set your profile to free if you are actively job hunting and want maximum visibility. Or set it to paid and choose the USDC price if you want companies to demonstrate serious intent before seeing your full history.',
            },
            {
              icon: <DollarSign size={18}/>,
              title: 'Earn from every view',
              body: 'When a company pays to access your profile, 70% of the payment goes straight to your connected Aptos wallet. The payment is enforced by a GenLayer smart contract. 7-day access windows mean recurring income from companies that keep returning to verify.',
            },
            {
              icon: <Clock size={18}/>,
              title: 'Your history is permanent',
              body: 'Every credential, every access payment, every GenLayer verdict is recorded as a blob on Shelby. Unlike LinkedIn or a PDF on a company server, your career record cannot be deleted, backdated or altered by anyone including Profilr.',
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

        <div className="card p-6 mb-8" style={{ border: '1.5px solid rgba(233,30,140,0.2)', background: 'var(--accent-pale)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--accent)' }}>What you need to get started</h3>
          <ul className="space-y-2">
            {[
              'An Aptos wallet such as Petra or Pontem (free to install)',
              'Aptos testnet tokens for gas (free from the Aptos faucet)',
              'Your credentials including degrees, job titles and certificates',
              'A few minutes to fill in your profile',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-sub)' }}>
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }}/>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/dashboard" className="btn-primary inline-flex">
          Create your profile now <ArrowRight size={15}/>
        </Link>
      </div>
    </div>
  )
}
