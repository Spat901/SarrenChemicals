import Link from 'next/link'
import type { Metadata } from 'next'
import MolecularCanvas from '@/components/MolecularCanvas'

export const metadata: Metadata = {
  title: 'Sarren Chemicals — Industrial Chemical Distribution',
  description: 'Reliable surplus chemical buying and selling since 1997. Submit an RFQ or sell us your surplus inventory.',
}

const categories = [
  {
    slug: 'resins',
    label: 'Category',
    title: 'Resins & Polymers',
    desc: 'Alkyd, acrylic, epoxy, and polyurethane resins for coatings and adhesives.',
  },
  {
    slug: 'solvents',
    label: 'Category',
    title: 'Solvents',
    desc: 'Ketones, esters, glycol ethers, and aromatic solvents in bulk and drum quantities.',
  },
  {
    slug: 'pigments',
    label: 'Category',
    title: 'Pigments & Extenders',
    desc: 'TiO₂, calcium carbonate, talc, and specialty pigments for paint and coatings.',
  },
  {
    slug: 'additives',
    label: 'Category',
    title: 'Additives',
    desc: 'Defoamers, rheology modifiers, dispersants, and coalescents for formulations.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Browse & Inquire',
    desc: 'Find what you need in our product categories and submit a Request for Quote. No account required.',
  },
  {
    num: '02',
    title: 'We Respond Promptly',
    desc: 'Our team reviews your inquiry and follows up with availability, pricing, and packaging options.',
  },
  {
    num: '03',
    title: 'Receive Your Order',
    desc: 'We arrange freight and deliver to your facility. Packaging options include drums, totes, and bulk.',
  },
]

const stats = [
  { value: '25+', label: 'Years in Business' },
  { value: '100%', label: 'Supplier Confidentiality' },
  { value: 'Bulk', label: 'Drums · Totes · Tankers' },
  { value: 'USA', label: 'Nationwide Distribution' },
]

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-navy text-white py-[120px] overflow-hidden">
        <MolecularCanvas />
        <div className="container-content relative z-10">
          <div className="max-w-[680px]">
            <p className="label text-white/50 mb-4">Chemical Distribution Since 1997</p>
            <h1 className="text-white mb-6">
              Reliable Supply.<br />
              Competitive Pricing.<br />
              Complete Confidentiality.
            </h1>
            <p className="text-white/85 text-[19px] mb-10 max-w-[60ch]">
              We buy and sell surplus, aged, and off-spec industrial chemicals. Inquiry-only pricing. No supplier names disclosed.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/products" className="btn btn-white">Browse Products</Link>
              <Link href="/contact#rfq" className="btn border-2 border-white/50 text-white hover:bg-white hover:text-navy hover:no-underline">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE SUPPLY */}
      <section className="section-pad">
        <div className="container-content">
          <div className="section-header">
            <p className="label">Product Categories</p>
            <h2>What We Supply</h2>
            <p>We carry a broad range of industrial chemicals across key categories. All pricing is inquiry-only.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(({ slug, label, title, desc }) => (
              <div key={slug} className="card flex flex-col">
                <p className="label mb-3">{label}</p>
                <h3 className="mb-2">{title}</h3>
                <p className="text-[15px] text-steel flex-1">{desc}</p>
                <Link href={`/products#${slug}`} className="btn btn-outline mt-6 h-10 text-[14px] self-start">
                  View Products
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="btn btn-primary">View Full Product List</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-pad section-alt">
        <div className="container-content">
          <div className="section-header">
            <p className="label">Process</p>
            <h2>How It Works</h2>
          </div>
          <div className="flex border border-border rounded bg-white">
            {steps.map(({ num, title, desc }, i) => (
              <div
                key={num}
                className={`flex-1 p-7 relative ${i < steps.length - 1 ? 'border-r border-border' : ''}`}
              >
                <p className="text-[13px] font-bold text-steel tracking-[0.1em] mb-4">{num}</p>
                <h3 className="text-[20px] mb-2">{title}</h3>
                <p className="text-[15px] text-steel max-w-none">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELL YOUR SURPLUS */}
      <section className="bg-navy section-pad">
        <div className="container-content">
          <div className="flex items-center justify-between gap-12 flex-wrap">
            <div className="max-w-[560px]">
              <p className="label text-white/50 mb-3">For Sellers</p>
              <h2 className="text-white mb-4">Have Surplus Inventory?</h2>
              <p className="text-white/80">
                We purchase surplus, aged, and off-spec chemicals confidentially. Quick turnaround, fair pricing, and complete discretion.
              </p>
            </div>
            <Link href="/sell-surplus" className="btn btn-white flex-shrink-0">
              Tell Us What You Have
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-offwhite border-t border-border border-b py-12">
        <div className="container-content">
          <div className="flex justify-center gap-20 flex-wrap">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-[42px] font-bold text-navy leading-none mb-2">{value}</div>
                <div className="text-[13px] font-medium uppercase tracking-[0.08em] text-steel">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
