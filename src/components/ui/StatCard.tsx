import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  label:    string
  value:    string | number
  icon?:    ReactNode
  sub?:     string
  className?: string
}

export function StatCard({ label, value, icon, sub, className }: StatCardProps) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-[var(--text-sub)]">{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-pale)] flex items-center justify-center text-[var(--accent)]">
            {icon}
          </div>
        )}
      </div>
      <p className="stat-num mt-2">{value}</p>
      {sub && <p className="text-xs text-[var(--text-dim)] mt-1">{sub}</p>}
    </div>
  )
}
