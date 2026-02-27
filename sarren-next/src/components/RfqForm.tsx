'use client'

import { useState, FormEvent } from 'react'

export default function RfqForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rfq', ...data }),
      })
      if (res.ok) {
        setStatus('sent')
        ;(e.target as HTMLFormElement).reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="rfq-name" className="form-label">Full Name</label>
          <input type="text" id="rfq-name" name="name" required placeholder="Jane Smith" className="form-input" />
        </div>
        <div>
          <label htmlFor="rfq-company" className="form-label">Company</label>
          <input type="text" id="rfq-company" name="company" required placeholder="Acme Coatings Co." className="form-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="rfq-email" className="form-label">Email</label>
          <input type="email" id="rfq-email" name="email" required placeholder="jane@company.com" className="form-input" />
        </div>
        <div>
          <label htmlFor="rfq-phone" className="form-label">Phone</label>
          <input type="tel" id="rfq-phone" name="phone" placeholder="(555) 000-0000" className="form-input" />
        </div>
      </div>
      <div>
        <label htmlFor="rfq-product" className="form-label">Product(s) of Interest</label>
        <input type="text" id="rfq-product" name="product" required placeholder="e.g. Alkyd Resin, TiO₂" className="form-input" />
      </div>
      <div>
        <label htmlFor="rfq-qty" className="form-label">Estimated Quantity &amp; Packaging</label>
        <input type="text" id="rfq-qty" name="quantity" placeholder="e.g. 5 drums, 1 tote, bulk" className="form-input" />
      </div>
      <div>
        <label htmlFor="rfq-notes" className="form-label">Additional Notes</label>
        <textarea id="rfq-notes" name="notes" placeholder="Spec requirements, timeline, application details..." className="form-textarea" />
      </div>
      <button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? "Sent! We'll be in touch." : 'Submit Request for Quote'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-sm">Something went wrong. Please email us directly at info@sarrenchemicals.com</p>
      )}
      <p className="text-[13px] text-steel">No supplier names are shared. All inquiries are handled confidentially.</p>
    </form>
  )
}
