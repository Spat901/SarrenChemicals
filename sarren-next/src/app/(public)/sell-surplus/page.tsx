import SurplusForm from '@/components/SurplusForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sell Your Surplus',
  description: 'Sell your surplus chemicals to Sarren Chemicals. Fast, confidential, fair pricing.',
}

const reasons = [
  {
    title: 'Complete Confidentiality',
    desc: 'Your company name and supplier information are never disclosed. We operate with full discretion.',
  },
  {
    title: 'Fast Turnaround',
    desc: 'We respond to surplus inquiries promptly. Most transactions are completed within days, not weeks.',
  },
  {
    title: 'Fair Market Pricing',
    desc: 'We offer competitive pricing for aged, off-spec, and surplus inventory. No lowball offers.',
  },
]

export default function SellSurplusPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">For Sellers</p>
          <h1 className="text-[40px] mb-4">Sell Us Your Surplus</h1>
          <p className="text-steel text-[18px]">We purchase surplus, aged, and off-spec chemicals quickly and confidentially. Tell us what you have.</p>
        </div>
      </div>

      {/* WHY SELL */}
      <section className="section-pad section-alt">
        <div className="container-content">
          <div className="section-header text-center max-w-[600px] mx-auto">
            <p className="label">Why Sarren</p>
            <h2>Quick. Confidential. Fair.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reasons.map(({ title, desc }) => (
              <div key={title} className="card text-center">
                <h3 className="mb-2">{title}</h3>
                <p className="text-[15px] mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="section-pad">
        <div className="container-content max-w-[720px] mx-auto">
          <div className="section-header">
            <p className="label">Surplus Intake</p>
            <h2>Tell Us What You Have</h2>
            <p>Fill out the form below. We&apos;ll review and follow up within one business day.</p>
          </div>
          <SurplusForm />
        </div>
      </section>
    </>
  )
}
