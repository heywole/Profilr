'use client'
import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Wallet, ChevronDown, LogOut, Copy, Check, ExternalLink } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'
import toast from 'react-hot-toast'

export function WalletButton() {
  const { connect, disconnect, account, connected, wallets, wallet } = useWallet()
  const [showList, setShowList] = useState(false)
  const [copied,   setCopied]   = useState(false)

  const copyAddr = async () => {
    await navigator.clipboard.writeText(account?.address?.toString() ?? '')
    setCopied(true)
    toast.success('Address copied')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!connected) return (
    <div className="relative">
      <button onClick={() => setShowList(v => !v)} className="btn-primary text-xs h-9 px-4">
        <Wallet size={13}/> Connect Wallet
      </button>
      {showList && (
        <div
          className="absolute right-0 top-11 z-50 w-56 card py-1"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', animation: 'fadeIn 0.15s ease' }}
        >
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest border-b mb-1"
            style={{ color: 'var(--text-dim)', borderColor: 'var(--border)' }}>
            Select wallet
          </p>
          {wallets?.length ? wallets.map(w => (
            <button
              key={w.name}
              onClick={() => { connect(w.name); setShowList(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors"
              style={{ color: 'var(--text)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              {w.icon && <img src={w.icon} alt={w.name} className="w-5 h-5 rounded" />}
              <span className="font-medium">{w.name}</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-dim)' }}>{w.readyState}</span>
            </button>
          )) : (
            <p className="px-3 py-3 text-xs" style={{ color: 'var(--text-dim)' }}>
              No Aptos wallets detected. Install Petra or Pontem.
            </p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="relative">
      <button
        onClick={() => setShowList(v => !v)}
        className="btn-outline text-xs h-9 px-4 gap-2"
      >
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
        {truncateAddress(account?.address?.toString() ?? '')}
        <ChevronDown size={12} />
      </button>

      {showList && (
        <div
          className="absolute right-0 top-11 z-50 w-52 card py-1"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', animation: 'fadeIn 0.15s ease' }}
        >
          <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Connected via</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{wallet?.name}</p>
          </div>

          <button
            onClick={copyAddr}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors"
            style={{ color: 'var(--text)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            {copied ? <Check size={13} style={{ color: 'var(--accent)' }} /> : <Copy size={13} />}
            Copy address
          </button>

          <a
            href={`https://explorer.aptoslabs.com/account/${account?.address}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors"
            style={{ color: 'var(--text)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            <ExternalLink size={13} /> View on Explorer
          </a>

          <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />

          <button
            onClick={() => { disconnect(); setShowList(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors text-red-500"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            <LogOut size={13} /> Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
