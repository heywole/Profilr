import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from 'next-themes'
import { Toaster }       from 'react-hot-toast'
import { WalletProvider } from '@/lib/wallet-provider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title:       'Profilr — Verified Professional Credentials',
  description: 'Own your career story. Store credentials on Shelby Protocol, verified by GenLayer AI.',
  icons: {
    icon:  '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <WalletProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background:   'var(--bg-panel)',
                  color:        'var(--text)',
                  border:       '1px solid var(--border)',
                  fontSize:     '14px',
                  borderRadius: '12px',
                },
                success: { iconTheme: { primary: '#E91E8C', secondary: '#fff' } },
              }}
            />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
