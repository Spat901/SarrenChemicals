import Link from 'next/link'

const pages = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/sell-surplus', label: 'Sell Your Surplus' },
  { href: '/logistics', label: 'Logistics' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const pdfs = [
  { href: '/pdfs/sarren-line-card.pdf', label: 'Line Card (PDF)' },
  { href: '/pdfs/sarren-capability-statement.pdf', label: 'Capability Statement (PDF)' },
  { href: '/pdfs/sarren-sample-coa.pdf', label: 'Sample COA (PDF)' },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-16 pb-8">
      <div className="max-w-content mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand */}
          <div>
            <img src="/images/logo.png" alt="Sarren Chemicals" className="h-[44px] w-auto block brightness-0 invert" />
            <p className="text-white/70 text-[15px] mt-4 max-w-[280px]">
              Buying and selling surplus, aged, and off-spec chemicals since 1997. Confidential. Reliable. Experienced.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/50 mb-4">Pages</h4>
            <ul className="list-none flex flex-col gap-[10px]">
              {pages.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/50 mb-4">Resources</h4>
            <ul className="list-none flex flex-col gap-[10px]">
              {pdfs.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/50 mb-4">Contact</h4>
            <ul className="list-none flex flex-col gap-[10px]">
              <li>
                <a href="mailto:info@sarrenchemicals.com" className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
                  info@sarrenchemicals.com
                </a>
              </li>
              <li>
                <a href="tel:+17169827394" className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
                  (716) 982-7394
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[13px] text-white/40">
          <span>&copy; {new Date().getFullYear()} Sarren Chemicals. All rights reserved.</span>
          <span>No supplier names are displayed on this site.</span>
        </div>
        <div className="mt-4 text-center text-[12px] text-white/25">
          Website designed by{' '}
          <a href="https://www.cordatallc.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 hover:no-underline transition-colors">
            CorData LLC
          </a>
        </div>
      </div>
    </footer>
  )
}
