import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type FormType = 'rfq' | 'surplus' | 'contact'

function buildSubject(type: FormType, data: Record<string, string>): string {
  switch (type) {
    case 'rfq': return `RFQ — ${data.product ?? 'Unknown product'} from ${data.company ?? data.name}`
    case 'surplus': return `Surplus Inquiry — ${data.material ?? 'Unknown material'} from ${data.company ?? data.name}`
    case 'contact': return `Contact Form — ${data.subject ?? 'General'} from ${data.name}`
  }
}

function buildBody(type: FormType, data: Record<string, string>): string {
  const lines = Object.entries(data)
    .filter(([key]) => key !== 'type')
    .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
  return `Form: ${type.toUpperCase()}\n\n${lines.join('\n')}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string> & { type: FormType }
    const { type, ...data } = body

    if (!type || !data.email || !data.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Sarren Chemicals Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL ?? 'info@sarrenchemicals.com',
      replyTo: data.email,
      subject: buildSubject(type, data),
      text: buildBody(type, data),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
