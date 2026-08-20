import fs from 'fs'
import path from 'path'
import { buildReceiptPdf } from './receipt.js'

async function run() {
  const donation = {
    receiptNo: 'GF-2026-000999',
    amount: 1000,
    mode: 'one-time',
    createdAt: new Date().toISOString(),
    donor: {
      name: 'Test Donor',
      email: 'test@example.com',
      phone: '9876543210',
      pan: 'ABCDE1234F',
      aadhar: '123412341234',
      address: '123 Test Street, Test City, Test State - 000000'
    },
    razorpay: { paymentId: 'pay_TEST' }
  }
  const pdf = await buildReceiptPdf(donation)
  const { fileURLToPath } = await import('url')
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const out = path.join(__dirname, '..', 'tmp')
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true })
  const file = path.join(out, `${donation.receiptNo}-sample.pdf`)
  fs.writeFileSync(file, pdf)
  console.log('Wrote test receipt to', file)
}

run().catch(err => { console.error(err); process.exit(1) })
