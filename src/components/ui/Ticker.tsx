'use client'
import { cn } from '@/lib/utils'

interface TickerProps {
  items:    string[]
  reverse?: boolean
  className?: string
}

export function Ticker({ items, reverse = false, className }: TickerProps) {
  const doubled = [...items, ...items]
  return (
    <div className={cn('relative overflow-hidden py-3', className)}>
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }}/>
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }}/>
      <div className={cn('ticker-track', reverse ? 'animate-ticker-rev' : 'animate-ticker')}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-sub)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0"/>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
