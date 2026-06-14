'use client'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import { ArrowLeft, Database, Shield, Zap, Globe, Lock } from 'lucide-react'

export default function HowShelby() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">

        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10" style={{ color: 'var(--text-sub)' }}>
          <ArrowLeft size={14}/> Back to home
        </Link>

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Storage layer</p>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>How Shelby Protocol stores your data</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-sub)' }}>
            Shelby is a decentralized hot storage protocol built on top of the Aptos blockchain. It is designed for fast, scalable, verifiable storage of large amounts of data — the kind of workload that traditional decentralized storage networks struggle with.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {[
            {
              icon: <Database size={18}/>,
              title: 'Blobs are the basic unit of storage',
              body: 'Everything on Shelby is stored as a blob. A blob can be any file: a JSON profile, an encrypted dataset, a PDF or an image. When Profilr stores your credentials, each one becomes a separate blob with its own unique ID. Blobs are immutable. Once uploaded, the content cannot be changed.',
            },
            {
              icon: <Shield size={18}/>,
              title: 'Merkle root integrity proofs',
              body: 'When a blob is uploaded, Shelby generates a Merkle root — a single cryptographic hash that fingerprints the entire file. This root is recorded on the Aptos blockchain. Anyone can download the file later and compute the same hash to prove the content has never been altered. Profilr uses this to let employers verify that the credentials they are reading are exactly what the candidate originally uploaded.',
            },
            {
              icon: <Zap size={18}/>,
              title: 'Sub-second reads at scale',
              body: 'Shelby uses erasure coding to split each blob into fragments distributed across multiple storage nodes. This means reads are extremely fast even under heavy load, and the data survives even if multiple nodes go offline simultaneously. This is what makes Shelby suitable for a profile platform rather than a slower archival storage network.',
            },
            {
              icon: <Globe size={18}/>,
              title: 'Aptos for coordination',
              body: 'Shelby uses the Aptos blockchain to coordinate storage, record Merkle roots, and handle payments in ShelbyUSD. When Profilr uploads a credential blob, the transaction is settled on Aptos. This creates a permanent, publicly verifiable record of when each credential was stored and by whom.',
            },
            {
              icon: <Lock size={18}/>,
              title: 'Encryption at the application layer',
              body: 'Shelby stores bytes and does not inspect content. Profilr uses this to implement privacy. Paid-access profiles store their full details as an encrypted blob on Shelby. Only a buyer who has been given the decryption key can read the content. Shelby nodes never see the plaintext, and neither does Profilr.',
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

        <div className="card p-5 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>Shelby blob types used by Profilr</p>
          <div className="space-y-2">
            {[
              { blob: 'profile.json',       desc: 'Your public display name, title, bio and access settings' },
              { blob: 'credential.json',    desc: 'Each individual credential with type, institution and dates' },
              { blob: 'verdict.json',       desc: 'GenLayer AI verdict and validator reasoning' },
              { blob: 'access_record.json', desc: 'Payment record with viewer, amount, expiry and tx hash' },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 py-2" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <code className="text-xs px-2 py-0.5 rounded font-mono flex-shrink-0"
                  style={{ background: 'var(--bg-muted)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                  {r.blob}
                </code>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <a href="https://shelby.xyz" target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex">
          Learn more at shelby.xyz
        </a>
      </div>
    </div>
  )
}
