import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logistics & Packaging',
  description: 'Sarren Chemicals packaging and freight options — drums, totes, bulk tankers, and nationwide shipping.',
}

const packaging = [
  { icon: '🛢', title: 'Drums', desc: '55-gallon steel and poly drums. Closed-head and open-head available. UN-rated where required.' },
  { icon: '📦', title: 'Totes (IBCs)', desc: '275 and 330-gallon intermediate bulk containers. Ideal for larger volumes without bulk tanker logistics.' },
  { icon: '🚛', title: 'Bulk Tanker', desc: 'Full and partial tanker loads for high-volume liquid materials. Inquire for scheduling and minimums.' },
  { icon: '🎒', title: 'Bags & Super Sacks', desc: '50 lb bags and 1-ton supersacks for dry materials including pigments, fillers, and drymix components.' },
]

const freightPoints = [
  'LTL and full truckload arrangements',
  'Hazmat-compliant shipping documentation',
  'SDS provided with every shipment',
  'COA available on request',
]

export default function LogisticsPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Shipping &amp; Packaging</p>
          <h1 className="text-[40px] mb-4">Logistics &amp; Packaging</h1>
          <p className="text-steel text-[18px]">We ship nationwide in a variety of packaging configurations to meet your volume and handling requirements.</p>
        </div>
      </div>

      {/* PACKAGING OPTIONS */}
      <section className="section-pad">
        <div className="container-content">
          <div className="section-header">
            <p className="label">Packaging</p>
            <h2>Available Packaging Formats</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packaging.map(({ icon, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="text-[40px] mb-4">{icon}</div>
                <h3 className="mb-2">{title}</h3>
                <p className="text-[15px] mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREIGHT */}
      <section className="section-pad section-alt">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="label mb-4">Shipping</p>
              <h2 className="mb-4">Nationwide Freight</h2>
              <p className="mt-4">We arrange freight to your facility across the contiguous United States. LTL, FTL, and tanker shipments coordinated through our carrier network.</p>
              <ul className="mt-6 flex flex-col gap-3 list-none">
                {freightPoints.map((point) => (
                  <li key={point} className="flex gap-3 items-start">
                    <span className="text-navy font-bold mt-[2px]">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <p className="label mb-4">Documentation</p>
              <h3 className="mb-4">What We Provide</h3>
              <p className="text-[15px]">Every shipment comes with complete documentation including Safety Data Sheet (SDS), bill of lading, and Certificate of Analysis upon request. Hazmat manifests provided where applicable.</p>
              <Link href="/contact" className="btn btn-outline mt-6 h-10 text-[14px] inline-flex hover:no-underline">
                Contact for Logistics Questions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
