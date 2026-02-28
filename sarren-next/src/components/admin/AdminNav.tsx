'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/pdfs', label: 'Documents' },
  ]

  return (
    <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <img src="/images/logo.png" alt="Sarren Chemicals" className="h-8 w-auto" />
        <nav className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 text-[14px] font-medium rounded hover:no-underline transition-colors ${
                pathname === href
                  ? 'text-navy bg-offwhite'
                  : 'text-steel hover:text-navy'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="text-[14px] text-steel hover:text-charcoal transition-colors"
      >
        Log out
      </button>
    </div>
  )
}
