'use client'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import { ArrowLeft, Brain, Vote, AlertTriangle, Code, CheckCircle } from 'lucide-react'

export default function HowGenLayer() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">

        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10" style={{ color: 'var(--text-sub)' }}>
          <ArrowLeft size={14}/> Back to home
        </Link>

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>AI consensus layer</p>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>How GenLayer verifies credentials</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-sub)' }}>
            GenLayer is a blockchain layer that runs Intelligent Contracts — smart contracts written in Python that can call large language models and fetch web content as part of their execution. Profilr uses GenLayer to verify credentials and enforce access windows without any human moderator.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {[
            {
              icon: <Brain size={18}/>,
              title: 'Intelligent Contracts with LLM execution',
              body: 'A standard smart contract can only execute deterministic logic. It cannot read a credential description and judge whether the institution is real. GenLayer adds an LLM execution layer on top of the blockchain so contracts can call AI models, fetch URLs and reason about unstructured text while still reaching consensus across multiple validators.',
            },
            {
              icon: <Vote size={18}/>,
              title: 'Optimistic Democracy consensus',
              body: 'When a credential is submitted for verification, five independent validators each run the same Intelligent Contract. Each validator uses a different underlying LLM model. They each independently read the credential, look up the institution in public records, and return a verdict of VERIFIED, REVIEWING or FAILED. A supermajority of four out of five validators must agree before the verdict is finalized on-chain.',
            },
            {
              icon: <AlertTriangle size={18}/>,
              title: 'What happens when validators disagree',
              body: 'If the five validators return a split result, for example three say VERIFIED and two say REVIEWING, the contract enters a review window. A larger set of validators is called to re-run the verification. Validators who deviate from the final consensus lose a portion of their staked tokens, making dishonest or careless validation economically costly.',
            },
            {
              icon: <Code size={18}/>,
              title: 'The Profilr verification prompt',
              body: 'The GenLayer contract sends each validator a structured prompt with the credential type, title and institution name. The prompt asks the validator to confirm the institution exists in public records, check whether the credential type is plausible for that institution, and flag any signs of fabrication. The validator must respond with a single-word verdict and one sentence of reasoning. Both are stored on-chain.',
            },
            {
              icon: <CheckCircle size={18}/>,
              title: 'Access enforcement by smart contract',
              body: 'GenLayer also handles the paid-access window. When a company pays to view a profile, the payment is recorded in the Profilr Intelligent Contract with the buyer wallet address and an expiry timestamp. When the profile page checks whether a wallet has access, it calls the GenLayer contract which returns true or false based on the on-chain record.',
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
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>GenLayer testnet</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-sub)' }}>
            Profilr runs on the GenLayer testnet. The Intelligent Contract is deployed at the address in your environment variables. You can view the contract, test its functions, and inspect past verdicts directly in GenLayer Studio.
          </p>
          <a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex text-sm">
            Open GenLayer Studio
          </a>
        </div>
      </div>
    </div>
  )
}
