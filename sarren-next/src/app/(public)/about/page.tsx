import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Sarren Chemicals — surplus chemical trading since 1997.',
}

const highlights = [
  { title: 'Established 1997', desc: 'Over two decades of experience navigating the surplus chemical market, building relationships, and delivering value on both sides of every transaction.' },
  { title: 'Confidentiality First', desc: "No supplier names. No disclosed sources. We handle every transaction with discretion — it's not a policy, it's the foundation of how we operate." },
  { title: 'Nationwide Reach', desc: 'We source and deliver across the contiguous United States, coordinating freight for drums, totes, and bulk tanker shipments.' },
]

const industries = [
  { title: 'Paint Manufacturers', desc: 'Architectural and industrial paint producers sourcing resins, solvents, pigments, and additives.' },
  { title: 'Adhesive Blenders', desc: 'Formulators of pressure-sensitive, structural, and reactive adhesive systems.' },
  { title: 'Drymix Producers', desc: 'Construction product manufacturers using fillers, polymers, and additives in drymix formulations.' },
  { title: 'Resin Users', desc: 'Industrial formulators requiring alkyd, acrylic, epoxy, or polyurethane resins in bulk.' },
  { title: 'Surplus Holders', desc: 'Manufacturers and distributors with excess, aged, or off-spec inventory looking to recover value.' },
]

export default function AboutPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Our Story</p>
          <h1 className="text-[40px] mb-4">About Sarren Chemicals</h1>
          <p className="text-steel text-[18px]">Buying and selling surplus, aged, and off-spec chemicals since 1997.</p>
        </div>
      </div>

      {/* STORY */}
      <section className="section-pad">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <div>
              <p className="label mb-4">Who We Are</p>
              <h2>A Trusted Partner in the Chemical Supply Chain</h2>
              <p className="mt-6">Sarren Chemicals has operated as a specialized chemical trading company for over 25 years. We connect buyers who need quality surplus material with sellers looking to recover value from off-spec or excess inventory.</p>
              <p className="mt-4">Our expertise spans resins, solvents, pigments, and additives — the building blocks used by paint manufacturers, adhesive blenders, drymix producers, and resin formulators across the United States.</p>
              <p className="mt-4">We operate with complete supplier confidentiality. The names of our sources are never disclosed — to anyone.</p>
            </div>
            <div className="flex flex-col gap-6">
              {highlights.map(({ title, desc }) => (
                <div key={title} className="card">
                  <h3 className="mb-2">{title}</h3>
                  <p className="text-[15px]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="section-pad section-alt">
        <div className="container-content">
          <div className="section-header text-center max-w-[560px] mx-auto">
            <p className="label">Industries Served</p>
            <h2>Who We Work With</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map(({ title, desc }) => (
              <div key={title} className="card">
                <h3 className="mb-2">{title}</h3>
                <p className="text-[15px] mt-2">{desc}</p>
              </div>
            ))}
            <div className="card">
              <Link href="/contact" className="hover:no-underline">
                <h3 className="mb-2">Not Sure?</h3>
                <p className="text-[15px] mt-2">Get in touch. If we can help, we will. If we can&apos;t, we&apos;ll say so.</p>
                <p className="mt-4 font-semibold text-navy text-[15px]">Contact us →</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy section-pad">
        <div className="container-content text-center max-w-[560px] mx-auto">
          <p className="label text-white/50 mb-4">Ready to Work Together?</p>
          <h2 className="text-white mb-4">Let&apos;s Talk</h2>
          <p className="text-white/80 mb-10">Whether you&apos;re buying or selling, we&apos;re straightforward to work with. Reach out and we&apos;ll respond promptly.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/products#rfq" className="btn btn-white hover:no-underline">Request a Quote</Link>
            <Link href="/sell-surplus" className="btn border-2 border-white/40 text-white hover:bg-white hover:text-navy hover:no-underline">Sell Your Surplus</Link>
          </div>
        </div>
      </section>
    </>
  )
}
