import { Router } from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import Donation from '../models/Donation.js'
import { emailDonorDocuments } from '../utils/receipt.js'
import { buildDonorCertificate } from '../utils/certificate.js'

const router = Router()

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const AADHAR_RE = /^[0-9]{12}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Ten digits, with 0 / 91 / 0091 tolerated in front; null when unreadable. */
function normalisePhone(value) {
  const d = String(value || '').replace(/\D/g, '')
  if (d.length === 10) return d
  if (d.length === 11 && d.startsWith('0')) return d.slice(1)
  if (d.length === 12 && d.startsWith('91')) return d.slice(2)
  if (d.length === 13 && d.startsWith('091')) return d.slice(3)
  if (d.length === 14 && d.startsWith('0091')) return d.slice(4)
  return null
}

/**
 * The browser checks these too, but a bad PAN would end up printed on an 80G
 * receipt, so the server does not take the client's word for it.
 */
function validateDonor(donor = {}) {
  if (!donor.name?.trim()) return { error: 'Please enter your full name.' }
  if (!EMAIL_RE.test(String(donor.email || '').trim())) return { error: 'Please enter a valid email address.' }

  let phone = ''
  if (String(donor.phone || '').trim()) {
    phone = normalisePhone(donor.phone)
    if (!phone) return { error: 'Enter a 10-digit mobile number — with or without 0 or +91 in front.' }
    if (!/^[6-9]/.test(phone)) return { error: 'An Indian mobile number starts with 6, 7, 8 or 9.' }
  }

  const pan = String(donor.pan || '').trim().toUpperCase()
  if (pan && !PAN_RE.test(pan)) {
    return { error: 'That PAN does not look right. The format is ABCDE1234F — five letters, four digits, then one letter.' }
  }

  const aadhar = String(donor.aadhar || '').replace(/\D/g, '')
  if (aadhar && !AADHAR_RE.test(aadhar)) {
    return { error: 'Aadhaar should be a 12-digit number.' }
  }

  return { clean: { name: donor.name.trim(), email: donor.email.trim(), phone, pan, aadhar: aadhar || '', address: (donor.address || '').trim() } }
}

const rzp = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })

// POST /api/donations/order — create a Razorpay order + pending donation record
router.post('/order', async (req, res) => {
  try {
    const { amount, mode = 'one-time', donor, options = {} } = req.body
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Please enter a donation amount of at least ₹1.' })
    }
    const { error: donorError, clean } = validateDonor(donor)
    if (donorError) return res.status(400).json({ error: donorError })
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET ||
        process.env.RAZORPAY_KEY_SECRET.includes('PASTE_YOUR')) {
      return res.status(500).json({ error: 'Razorpay keys are not configured on the server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env and restart.' })
    }
    const order = await rzp().orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      notes: { mode, donorEmail: clean.email },
    })
    // Respect the donor's preference for public listing
    if (typeof options.showName === 'boolean') {
      clean.anonymous = !options.showName
    }
    const donation = await Donation.create({
      mode, amount, donor: clean,
      options: {
        taxExemption: !!options.taxExemption,
        isGift: !!options.isGift,
        showName: options.showName !== false,
      },
      razorpay: { orderId: order.id },
    })
    res.json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
      receiptNo: donation.receiptNo,
    })
  } catch (err) {
    // Razorpay auth failures land here — surface the reason instead of a generic 500
    const rzpMsg = err?.error?.description || err?.message
    console.error('Order creation failed:', rzpMsg || err)
    res.status(err?.statusCode || 500).json({
      error: rzpMsg ? `Razorpay: ${rzpMsg}` : 'Could not create payment order.',
    })
  }
})

// POST /api/donations/verify — verify checkout signature, mark paid, email receipt + certificate
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Signature verification failed.' })
  }

  const donation = await Donation.findOneAndUpdate(
    { 'razorpay.orderId': razorpay_order_id },
    {
      status: 'paid',
      'razorpay.paymentId': razorpay_payment_id,
      'razorpay.signatureVerified': true,
    },
    { new: true }
  )
  if (!donation) return res.status(404).json({ error: 'Donation not found.' })

  const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`
  emailDonorDocuments(donation, { baseUrl })
    .catch(err => console.error('Donor email failed:', err.message))
  res.json({ ok: true, receiptNo: donation.receiptNo })
})

// POST /api/donations/webhook — server-to-server safety net (payment.captured / failed)
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature']
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body) // raw body buffer
    .digest('hex')
  if (signature !== expected) return res.status(400).send('bad signature')

  const event = JSON.parse(req.body.toString())
  const payment = event?.payload?.payment?.entity
  if (!payment) return res.json({ ok: true })

  if (event.event === 'payment.captured') {
    const donation = await Donation.findOneAndUpdate(
      { 'razorpay.orderId': payment.order_id, status: { $ne: 'paid' } },
      { status: 'paid', 'razorpay.paymentId': payment.id, 'razorpay.method': payment.method },
      { new: true }
    )
    if (donation && !donation.receiptEmailedAt) {
      const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`
      emailDonorDocuments(donation, { baseUrl })
        .catch(err => console.error('Donor email failed:', err.message))
    }
  } else if (event.event === 'payment.failed') {
    await Donation.updateOne(
      { 'razorpay.orderId': payment.order_id },
      { status: 'failed' }
    )
  }
  res.json({ ok: true })
})

// GET /api/donations/recent — public list of recent donors for the "recent donors" widget
// (name + amount only; email/PAN never exposed). Respects an opt-out flag.
router.get('/recent', async (_req, res) => {
  const donations = await Donation.find({ status: 'paid', 'donor.anonymous': { $ne: true } })
    .sort('-updatedAt')
    .limit(10)
    .select('donor.name amount mode updatedAt -_id')
  res.json(
    donations.map((d) => ({
      name: d.donor.name,
      amount: d.amount,
      mode: d.mode,
      at: d.updatedAt,
    }))
  )
})

// GET /api/donations/:receiptNo/certificate — donor appreciation certificate (PDF)
router.get('/:receiptNo/certificate', async (req, res) => {
  const donation = await Donation.findOne({ receiptNo: req.params.receiptNo, status: 'paid' })
  if (!donation) return res.status(404).json({ error: 'Paid donation not found.' })
  const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`
  const pdf = await buildDonorCertificate(donation, { baseUrl })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${donation.receiptNo}-appreciation.pdf"`)
  res.send(pdf)
})

export default router
