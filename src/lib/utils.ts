import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const truncateAddress = (addr: string, chars = 6) =>
  addr ? `${addr.slice(0, chars)}…${addr.slice(-4)}` : ''

export const formatUsdc = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export const timeAgo   = (ts: number) => dayjs(ts).fromNow()
export const fmtDate   = (ts: number | string) => dayjs(ts).format('MMM YYYY')
export const fmtDateFull = (ts: number) => dayjs(ts).format('D MMM YYYY')
export const daysLeft  = (exp: number) => Math.max(0, Math.ceil((exp - Date.now()) / 86_400_000))
export const isExpired = (exp: number) => Date.now() > exp

export const credLabel = (type: string) => ({
  education:'Education', work:'Work Experience',
  certification:'Certification', project:'Project',
  skill:'Skill', award:'Award',
}[type] ?? type)

export const credEmoji = (type: string) => ({
  education:'🎓', work:'💼', certification:'📜',
  project:'🚀', skill:'⚡', award:'🏆',
}[type] ?? '📄')

export const splitRevenue = (amount: number) => ({
  owner:    +(amount * 0.70).toFixed(2),
  platform: +(amount * 0.20).toFixed(2),
  genlayer: +(amount * 0.10).toFixed(2),
})

export const profileUrl = (addr: string) =>
  `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/profile/${addr}`

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
