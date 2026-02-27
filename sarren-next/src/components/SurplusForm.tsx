'use client'

import { useState, FormEvent } from 'react'

export default function SurplusForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'surplus', ...data }),
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
          <label htmlFor="s-name" className="form-label">Full Name</label>
          <input type="text" id="s-name" name="name" required placeholder="John Smith" className="form-input" />
        </div>
        <div>
          <label htmlFor="s-company" className="form-label">Company</label>
          <input type="text" id="s-company" name="company" required placeholder="Your Company" className="form-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="s-email" className="form-label">Email</label>
          <input type="email" id="s-email" name="email" required placeholder="john@company.com" className="form-input" />
        </div>
        <div>
          <label htmlFor="s-phone" className="form-label">Phone</label>
          <input type="tel" id="s-phone" name="phone" placeholder="(555) 000-0000" className="form-input" />
        </div>
      </div>
      <div>
        <label htmlFor="s-material" className="form-label">Material Description</label>
        <input type="text" id="s-material" name="material" required placeholder="e.g. Alkyd Resin, Off-spec TiO₂" className="form-input" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="s-qty" className="form-label">Quantity &amp; Packaging</label>
          <input type="text" id="s-qty" name="quantity" placeholder="e.g. 20 drums, 2 totes" className="form-input" />
        </div>
        <div>
          <label htmlFor="s-location" className="form-label">Material Location</label>
          <input type="text" id="s-location" name="location" placeholder="City, State" className="form-input" />
        </div>
      </div>
      <div>
        <label htmlFor="s-condition" className="form-label">Material Condition</label>
        <select id="s-condition" name="condition" className="form-select">
          <option value="">Select condition...</option>
          <option>Surplus / Excess Stock</option>
          <option>Aged / Near Expiry</option>
          <option>Off-Spec</option>
          <option>Unknown / Mixed</option>
        </select>
      </div>
      <div>
        <label htmlFor="s-notes" className="form-label">Additional Details</label>
        <textarea id="s-notes" name="notes" placeholder="Lot numbers, test data, reason for sale, urgency..." className="form-textarea" />
      </div>
      <button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? "Received! We'll be in touch." : 'Submit Surplus Inquiry'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-sm">Something went wrong. Please email us at info@sarrenchemicals.com</p>
      )}
      <p className="text-[13px] text-steel">All submissions are handled in strict confidence. No information is shared without your consent.</p>
    </form>
  )
}
