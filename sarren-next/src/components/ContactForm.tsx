'use client'

import { useState, FormEvent } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', ...data }),
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
          <label htmlFor="c-name" className="form-label">Full Name</label>
          <input type="text" id="c-name" name="name" required placeholder="Jane Smith" className="form-input" />
        </div>
        <div>
          <label htmlFor="c-company" className="form-label">Company</label>
          <input type="text" id="c-company" name="company" placeholder="Acme Co." className="form-input" />
        </div>
      </div>
      <div>
        <label htmlFor="c-email" className="form-label">Email</label>
        <input type="email" id="c-email" name="email" required placeholder="jane@company.com" className="form-input" />
      </div>
      <div>
        <label htmlFor="c-subject" className="form-label">Subject</label>
        <select id="c-subject" name="subject" className="form-select">
          <option value="">Select a topic...</option>
          <option>Product Inquiry / RFQ</option>
          <option>Sell My Surplus</option>
          <option>Logistics Question</option>
          <option>General Inquiry</option>
        </select>
      </div>
      <div>
        <label htmlFor="c-message" className="form-label">Message</label>
        <textarea id="c-message" name="message" required placeholder="How can we help?" className="form-textarea" />
      </div>
      <button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Message sent!' : 'Send Message'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-sm">Something went wrong. Please email us directly at info@sarrenchemicals.com</p>
      )}
    </form>
  )
}
