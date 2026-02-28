// Run with: npm run seed
// Requires KV env vars to be set in .env.local

import { kv } from '@vercel/kv'

const catalog = {
  categories: [
    {
      id: 'resins',
      title: 'Resins & Polymers',
      products: [
        { id: crypto.randomUUID(), label: 'Resin', name: 'Alkyd Resin', desc: 'Short, medium, and long oil alkyds for architectural and industrial coatings. Available in drums and totes.' },
        { id: crypto.randomUUID(), label: 'Resin', name: 'Acrylic Emulsion', desc: 'Waterborne acrylic dispersions for interior and exterior paint formulations.' },
        { id: crypto.randomUUID(), label: 'Resin', name: 'Epoxy Resin', desc: 'Liquid epoxy resins for flooring, industrial coatings, and adhesive applications.' },
        { id: crypto.randomUUID(), label: 'Resin', name: 'Polyurethane Resin', desc: 'Moisture-cure and two-component polyurethane resins for protective coatings.' },
        { id: crypto.randomUUID(), label: 'Resin', name: 'Vinyl Acetate Polymer', desc: 'PVA dispersions and copolymers for adhesives, construction, and drymix applications.' },
      ],
    },
    {
      id: 'solvents',
      title: 'Solvents',
      products: [
        { id: crypto.randomUUID(), label: 'Solvent', name: 'Methyl Ethyl Ketone (MEK)', desc: 'High-purity MEK for coatings, adhesives, and cleaning applications. Drum and bulk available.' },
        { id: crypto.randomUUID(), label: 'Solvent', name: 'Butyl Acetate', desc: 'Industrial grade n-butyl acetate for lacquers, varnishes, and coatings formulations.' },
        { id: crypto.randomUUID(), label: 'Solvent', name: 'Propylene Glycol Methyl Ether (PM)', desc: 'Glycol ether solvent for waterborne and solventborne coating systems.' },
        { id: crypto.randomUUID(), label: 'Solvent', name: 'Mineral Spirits', desc: 'Aliphatic hydrocarbon solvent for alkyd-based paints and industrial cleaning.' },
      ],
    },
    {
      id: 'pigments',
      title: 'Pigments & Extenders',
      products: [
        { id: crypto.randomUUID(), label: 'Pigment', name: 'Titanium Dioxide (TiO₂)', desc: 'Rutile and anatase grades for architectural paint, industrial coatings, and plastics.' },
        { id: crypto.randomUUID(), label: 'Extender', name: 'Calcium Carbonate', desc: 'Coated and uncoated calcium carbonate for drymix, paint, and sealant applications.' },
        { id: crypto.randomUUID(), label: 'Extender', name: 'Talc', desc: 'Platy talc grades for barrier properties and sag resistance in coatings and sealants.' },
        { id: crypto.randomUUID(), label: 'Pigment', name: 'Iron Oxide Pigments', desc: 'Red, yellow, and black synthetic iron oxides for concrete, coatings, and construction.' },
      ],
    },
    {
      id: 'additives',
      title: 'Additives',
      products: [
        { id: crypto.randomUUID(), label: 'Additive', name: 'Defoamers', desc: 'Mineral oil and silicone-based defoamers for waterborne and solventborne systems.' },
        { id: crypto.randomUUID(), label: 'Additive', name: 'Rheology Modifiers', desc: 'HEUR, HMHEC, and clay-based thickeners for paints, adhesives, and sealants.' },
        { id: crypto.randomUUID(), label: 'Additive', name: 'Dispersants & Wetting Agents', desc: 'Polymeric dispersants for pigment grinding and stabilization in waterborne systems.' },
        { id: crypto.randomUUID(), label: 'Additive', name: 'Coalescents', desc: 'Texanol and alternative coalescents to aid film formation in latex paints.' },
      ],
    },
  ],
}

await kv.set('products', catalog)
console.log('✓ Products seeded to Vercel KV')
console.log(`  ${catalog.categories.length} categories`)
console.log(`  ${catalog.categories.reduce((s, c) => s + c.products.length, 0)} products`)

await kv.set('pdfs', { documents: [] })
console.log('✓ PDFs catalog initialized (empty)')

process.exit(0)
