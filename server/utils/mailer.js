import nodemailer from 'nodemailer'

/**
 * Outgoing mail, over whichever transport is configured.
 *
 * Resend is preferred because it posts over HTTPS (port 443). Render's free
 * instances block outbound SMTP ports (25/465/587), so Gmail SMTP silently
 * times out there — which is why donation receipts stopped being delivered.
 *
 * SMTP is kept as a fallback so local development still works with a Gmail
 * app password and no API key.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

export function getTransport() {
  if (process.env.BREVO_API_KEY) return { kind: 'brevo', send: sendViaBrevo }
  if (process.env.RESEND_API_KEY) return { kind: 'resend', send: sendViaResend }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return { kind: 'smtp', send: sendViaSmtp }
  }
  return { kind: 'none', send: async () => { throw new Error('No mail transport configured.') } }
}

function parseSender(value) {
  const fallback = 'Guruvan Foundation <onboarding@brevo.com>'
  const match = String(value || fallback).match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (match) return { name: match[1].trim() || 'Guruvan Foundation', email: match[2].trim() }
  return { name: 'Guruvan Foundation', email: String(value || fallback).trim() }
}

async function sendViaBrevo(msg) {
  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: parseSender(fromAddress()),
      to: [{ email: msg.to }],
      subject: msg.subject,
      textContent: msg.text,
      htmlContent: msg.html,
      attachment: (msg.attachments || []).map((a) => ({
        name: a.filename,
        content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : a.content,
      })),
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Brevo rejected the message (${res.status}): ${detail.slice(0, 300)}`)
  }
  return res.json()
}

export function fromAddress() {
  return (
    process.env.MAIL_FROM ||
    (process.env.SMTP_USER ? `Guruvan Foundation <${process.env.SMTP_USER}>` : 'Guruvan Foundation <onboarding@brevo.com>')
  )
}

/**
 * @param {{to: string, subject: string, text: string, html: string,
 *          attachments?: {filename: string, content: Buffer, cid?: string}[]}} msg
 */
async function sendViaResend(msg) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [msg.to],
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      attachments: (msg.attachments || []).map((a) => ({
        filename: a.filename,
        content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : a.content,
      })),
    }),
  })

  if (!res.ok) {
    // Resend returns a JSON body describing what it rejected — surface it rather
    // than a bare status code, so a bad key or unverified domain is obvious.
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend rejected the message (${res.status}): ${detail.slice(0, 300)}`)
  }
  return res.json()
}

async function sendViaSmtp(msg) {
  const port = Number(process.env.SMTP_PORT || 465)
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 is implicit TLS; 587 upgrades with STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transport.sendMail({
    from: fromAddress(),
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    attachments: msg.attachments,
  })
}
