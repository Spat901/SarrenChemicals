'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/sell-surplus', label: 'Sell Your Surplus' },
  { href: '/logistics', label: 'Logistics' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-border">
      <div className="max-w-content mx-auto px-8 h-[72px] flex items-center justify-between">
        <Link href="/" className="hover:no-underline">
          <img src="/images/logo.png" alt="Sarren Chemicals" className="h-10 w-auto block" />
        </Link>

        {/* Mobile toggle */}
        <button
          className="flex md:hidden flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="block w-6 h-[2px] bg-charcoal transition-transform" />
          <span className="block w-6 h-[2px] bg-charcoal transition-transform" />
          <span className="block w-6 h-[2px] bg-charcoal transition-transform" />
        </button>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-9 list-none items-center">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-[14px] font-medium uppercase tracking-[0.04em] hover:text-navy hover:no-underline transition-colors ${
                  pathname === href ? 'text-navy font-semibold' : 'text-charcoal'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="ml-4">
            <Link href="/contact#rfq" className="btn btn-primary">
              Request a Quote
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute left-0 right-0 bg-white border-b border-border z-[99] px-8 py-6 flex flex-col gap-5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-[14px] font-medium uppercase tracking-[0.04em] hover:text-navy hover:no-underline ${
                pathname === href ? 'text-navy font-semibold' : 'text-charcoal'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link href="/contact#rfq" className="btn btn-primary w-full justify-center" onClick={() => setOpen(false)}>
            Request a Quote
          </Link>
        </div>
      )}
    </nav>
  )
}
