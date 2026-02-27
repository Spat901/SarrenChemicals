import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Sarren Chemicals — get in touch for inquiries, quotes, and surplus.',
}

const pdfs = [
  { href: '/pdfs/sarren-line-card.pdf', label: 'Download Line Card (PDF)' },
  { href: '/pdfs/sarren-capability-statement.pdf', label: 'Capability Statement (PDF)' },
  { href: '/pdfs/sarren-sample-coa.pdf', label: 'Sample COA (PDF)' },
]

export default function ContactPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Get In Touch</p>
          <h1 className="text-[40px] mb-4">Contact Us</h1>
          <p className="text-steel text-[18px]">Reach out for product inquiries, surplus purchases, logistics questions, or anything else.</p>
        </div>
      </div>

      <section className="section-pad">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            {/* FORM */}
            <div>
              <h2 className="mb-8" id="rfq">Send a Message</h2>
              <ContactForm />
            </div>

            {/* CONTACT INFO */}
            <div>
              <h2 className="mb-8">Contact Information</h2>
              <div className="flex flex-col gap-6">
                <div className="card">
                  <p className="label mb-2">Email</p>
                  <a href="mailto:info@sarrenchemicals.com" className="text-[17px] font-medium hover:no-underline">info@sarrenchemicals.com</a>
                </div>
                <div className="card">
                  <p className="label mb-2">Phone</p>
                  <a href="tel:+1-716-982-7394" className="text-[17px] font-medium hover:no-underline">(XXX) XXX-XXXX</a>
                </div>
                <div className="card">
                  <p className="label mb-3">Resources</p>
                  <ul className="list-none flex flex-col gap-3">
                    {pdfs.map(({ href, label }) => (
                      <li key={href}>
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[15px] hover:no-underline">↓ {label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <p className="label mb-2">Looking to Sell?</p>
                  <p className="text-[15px] mb-4">Have surplus or off-spec inventory? Use our dedicated form for faster processing.</p>
                  <Link href="/sell-surplus" className="btn btn-outline h-10 text-[14px] inline-flex hover:no-underline">Sell Your Surplus →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
