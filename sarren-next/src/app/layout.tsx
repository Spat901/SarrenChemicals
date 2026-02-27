import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Sarren Chemicals — Industrial Chemical Distribution',
    template: '%s — Sarren Chemicals',
  },
  description: 'Buying and selling surplus, aged, and off-spec industrial chemicals since 1997. Inquiry-only pricing. Complete supplier confidentiality.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  )
}
