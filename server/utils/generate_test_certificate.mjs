import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildDonorCertificate } from './certificate.js'

async function run() {
  const donation = {
    receiptNo: 'GF-2026-000999',
    amount: 1000,
    mode: 'one-time',
    createdAt: new Date().toISOString(),
    donor: {
      name: 'Mihirkumar Solanki',
      email: 'test@example.com',
      phone: '9876543210',
      pan: 'OVBPS0443G',
      aadhar: '123412341234',
      address: 'Sarval\nHarij\nGujarat - 385515'
    },
    razorpay: { paymentId: 'pay_TEST' },
    options: { taxExemption: true }
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const out = path.join(__dirname, '..', 'tmp')
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true })

  const pdf = await buildDonorCertificate(donation, { baseUrl: 'https://example.org' })
  const file = path.join(out, `${donation.receiptNo}-certificate-sample.pdf`)
  fs.writeFileSync(file, pdf)
  console.log('Wrote test certificate to', file)
}

run().catch(err => { console.error(err); process.exit(1) })
