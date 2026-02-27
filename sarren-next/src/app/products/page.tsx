import RfqForm from '@/components/RfqForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse Sarren Chemicals industrial chemical inventory. Submit an RFQ for pricing.',
}

type Product = { label: string; name: string; desc: string }
type Category = { id: string; title: string; products: Product[] }

const categories: Category[] = [
  {
    id: 'resins',
    title: 'Resins & Polymers',
    products: [
      { label: 'Resin', name: 'Alkyd Resin', desc: 'Short, medium, and long oil alkyds for architectural and industrial coatings. Available in drums and totes.' },
      { label: 'Resin', name: 'Acrylic Emulsion', desc: 'Waterborne acrylic dispersions for interior and exterior paint formulations.' },
      { label: 'Resin', name: 'Epoxy Resin', desc: 'Liquid epoxy resins for flooring, industrial coatings, and adhesive applications.' },
      { label: 'Resin', name: 'Polyurethane Resin', desc: 'Moisture-cure and two-component polyurethane resins for protective coatings.' },
      { label: 'Resin', name: 'Vinyl Acetate Polymer', desc: 'PVA dispersions and copolymers for adhesives, construction, and drymix applications.' },
    ],
  },
  {
    id: 'solvents',
    title: 'Solvents',
    products: [
      { label: 'Solvent', name: 'Methyl Ethyl Ketone (MEK)', desc: 'High-purity MEK for coatings, adhesives, and cleaning applications. Drum and bulk available.' },
      { label: 'Solvent', name: 'Butyl Acetate', desc: 'Industrial grade n-butyl acetate for lacquers, varnishes, and coatings formulations.' },
      { label: 'Solvent', name: 'Propylene Glycol Methyl Ether (PM)', desc: 'Glycol ether solvent for waterborne and solventborne coating systems.' },
      { label: 'Solvent', name: 'Mineral Spirits', desc: 'Aliphatic hydrocarbon solvent for alkyd-based paints and industrial cleaning.' },
    ],
  },
  {
    id: 'pigments',
    title: 'Pigments & Extenders',
    products: [
      { label: 'Pigment', name: 'Titanium Dioxide (TiO₂)', desc: 'Rutile and anatase grades for architectural paint, industrial coatings, and plastics.' },
      { label: 'Extender', name: 'Calcium Carbonate', desc: 'Coated and uncoated calcium carbonate for drymix, paint, and sealant applications.' },
      { label: 'Extender', name: 'Talc', desc: 'Platy talc grades for barrier properties and sag resistance in coatings and sealants.' },
      { label: 'Pigment', name: 'Iron Oxide Pigments', desc: 'Red, yellow, and black synthetic iron oxides for concrete, coatings, and construction.' },
    ],
  },
  {
    id: 'additives',
    title: 'Additives',
    products: [
      { label: 'Additive', name: 'Defoamers', desc: 'Mineral oil and silicone-based defoamers for waterborne and solventborne systems.' },
      { label: 'Additive', name: 'Rheology Modifiers', desc: 'HEUR, HMHEC, and clay-based thickeners for paints, adhesives, and sealants.' },
      { label: 'Additive', name: 'Dispersants & Wetting Agents', desc: 'Polymeric dispersants for pigment grinding and stabilization in waterborne systems.' },
      { label: 'Additive', name: 'Coalescents', desc: 'Texanol and alternative coalescents to aid film formation in latex paints.' },
    ],
  },
]

export default function ProductsPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Inventory</p>
          <h1 className="text-[40px] mb-4">Products</h1>
          <p className="text-steel text-[18px]">Browse available inventory by category. All pricing is inquiry-only — submit an RFQ for quotes.</p>
        </div>
      </div>

      {/* CATEGORY NAV */}
      <div className="border-b border-border bg-white sticky top-[72px] z-50">
        <div className="container-content flex gap-0 overflow-x-auto">
          {categories.map(({ id, title }) => (
            <a
              key={id}
              href={`#${id}`}
              className="px-5 py-3 text-[14px] font-medium text-steel border-b-2 border-transparent hover:text-navy hover:border-navy hover:no-underline whitespace-nowrap transition-colors"
            >
              {title}
            </a>
          ))}
        </div>
      </div>

      {/* PRODUCT CATEGORIES */}
      <section className="section-pad">
        <div className="container-content space-y-[72px]">
          {categories.map(({ id, title, products }) => (
            <div key={id} id={id}>
              <h2 className="mb-8 pb-4 border-b border-border">{title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(({ label, name, desc }) => (
                  <div key={name} className="card flex flex-col">
                    <p className="label mb-3">{label}</p>
                    <h3 className="text-[18px] mb-2">{name}</h3>
                    <p className="text-[15px] text-steel flex-1">{desc}</p>
                    <a href="#rfq" className="btn btn-outline mt-5 h-10 text-[14px] self-start hover:no-underline">
                      Request a Quote
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RFQ FORM */}
      <section className="section-alt section-pad" id="rfq">
        <div className="container-content max-w-[720px] mx-auto">
          <div className="section-header">
            <p className="label">Pricing Inquiry</p>
            <h2>Request a Quote</h2>
            <p>All pricing is by inquiry only. Fill out the form below and we&apos;ll respond within one business day.</p>
          </div>
          <RfqForm />
        </div>
      </section>
    </>
  )
}
