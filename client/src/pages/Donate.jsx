import { useState } from 'react'
import { PageHero } from './PagePlaceholder.jsx'
import { ShieldCheckIcon, ReceiptIcon, PeopleIcon, HandPlantIcon } from '../components/Icons.jsx'
import { apiUrl } from '../lib/api.js'

const presets = [250, 500, 1000, 2500]

const impact = [
  { amount: 250, text: 'Plants and nurtures one tree through Project Virasat Vana.' },
  { amount: 1000, text: 'A learning kit — books, bag and stationery — for one student.' },
  { amount: 5000, text: 'Supports a community health camp serving families for a day.' },
]

const trust = [
  { Icon: ShieldCheckIcon, title: '100% Secure Transactions' },
  { Icon: ReceiptIcon,     title: 'Your donation is tax exempted' },
  { Icon: PeopleIcon,      title: 'Transparency & Accountability' },
  { Icon: HandPlantIcon,   title: 'Direct Impact on Communities' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/

/**
 * Accepts the ways people actually type an Indian mobile number —
 * "98765 43210", "098765-43210", "+91 98765 43210", "0091..." — and returns
 * the bare ten digits, or null if it cannot be read as one.
 */
function normalisePhone(value) {
  const digits = (value || '').replace(/\D/g, '')
  if (digits.length === 10) return digits
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 13 && digits.startsWith('091')) return digits.slice(3)
  if (digits.length === 14 && digits.startsWith('0091')) return digits.slice(4)
  return null
}

function phoneError(value) {
  if (!value.trim()) return 'Please enter your mobile number.'
  const digits = normalisePhone(value)
  if (!digits) return 'Enter a 10-digit mobile number — with or without 0 or +91 in front.'
  if (!/^[6-9]/.test(digits)) return 'An Indian mobile number starts with 6, 7, 8 or 9.'
  return ''
}

function panError(value) {
  const pan = value.trim().toUpperCase()
  if (!pan) return 'Please enter your PAN.'
  if (pan.length !== 10) return 'A PAN is exactly 10 characters, like ABCDE1234F.'
  if (!PAN_RE.test(pan)) return 'That PAN does not look right. The format is ABCDE1234F — five letters, four digits, then one letter.'
  return ''
}

export default function Donate() {
  const requestedAmount = Number(new URLSearchParams(window.location.search).get('amount'))
  const [mode, setMode] = useState('one-time')
  const [amount, setAmount] = useState(requestedAmount > 0 ? requestedAmount : 250)
  const [custom, setCustom] = useState('')
  const [donor, setDonor] = useState({ name: '', email: '', phone: '', pan: '', aadhar: '', address: '' })
  const [options, setOptions] = useState({ taxExemption: false, isGift: false, showName: false })
  const [status, setStatus] = useState(null)
  const [touched, setTouched] = useState({})
  const finalAmount = custom ? Number(custom) : amount

  const errors = {
    name: donor.name.trim() ? '' : 'Please enter your full name.',
    email: EMAIL_RE.test(donor.email.trim()) ? '' : 'Please enter a valid email address.',
    phone: phoneError(donor.phone),
    pan: panError(donor.pan),
    aadhar: donor.aadhar.trim() && !/^\d{12}$/.test(donor.aadhar.replace(/\D/g, '')) ? 'Aadhaar should be 12 digits.' : '',
    address: donor.address.trim() ? '' : 'Please enter your address.'
  }
  const showError = (field) => (touched[field] ? errors[field] : '')
  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }))
  const fieldClass = (field) =>
    `rounded-lg border-2 bg-white px-4 py-3 outline-none ${
      showError(field) ? 'border-red-300 focus:border-red-500' : 'border-forest-100 focus:border-forest-600'
    }`

  async function payNow() {
    setTouched({ name: true, email: true, phone: true, pan: true, aadhar: true, address: true })
    const firstError = errors.name || errors.email || errors.phone || errors.pan || errors.aadhar || errors.address
    if (firstError) {
      setStatus({ type: 'error', msg: firstError })
      return
    }
    if (!finalAmount || finalAmount < 1) {
      setStatus({ type: 'error', msg: 'Please enter a valid donation amount.' })
      return
    }
    const cleanDonor = { ...donor, phone: normalisePhone(donor.phone) || '', pan: donor.pan.trim(), aadhar: (donor.aadhar || '').replace(/\D/g, ''), address: donor.address.trim() }
    setStatus({ type: 'info', msg: 'Preparing secure payment…' })
    try {
      // 1) Create order on our server
      const res = await fetch(apiUrl('/api/donations/order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, mode, donor: cleanDonor, options }),
      }).catch(() => { throw new Error('Cannot reach the server. Is the backend running on port 5000?') })

      const raw = await res.text()
      let order = {}
      try { order = raw ? JSON.parse(raw) : {} } catch {
        throw new Error(`Server error (${res.status}). Check the backend terminal — the Razorpay key or database may not be configured.`)
      }
      if (!res.ok) throw new Error(order.error || `Could not create order (${res.status}).`)
      if (!order.orderId) throw new Error('Server did not return an order. Check RAZORPAY_KEY_SECRET in server/.env.')

      // 2) Open Razorpay Checkout — UPI, cards, netbanking, wallets, EMI
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: 'INR',
        name: 'Guruvan Foundation',
        description: mode === 'monthly' ? 'Monthly Donation' : 'One-time Donation',
        image: '/logo.png',
        prefill: { name: cleanDonor.name, email: cleanDonor.email, contact: cleanDonor.phone },
        notes: { pan: cleanDonor.pan },
        theme: { color: '#14402b' },
        modal: {
          ondismiss: () =>
            setStatus({ type: 'info', msg: 'Payment cancelled. You can try again whenever you like.' }),
        },
        handler: async (resp) => {
          // 3) Verify signature server-side, then receipt is emailed automatically
          const vres = await fetch(apiUrl('/api/donations/verify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resp),
          })
          const v = await vres.json()
          if (vres.ok && v.ok) {
            setStatus({
              type: 'success',
              msg: `Thank you! Receipt ${v.receiptNo} has been emailed to you.`,
              certUrl: apiUrl(`/api/donations/${v.receiptNo}/certificate`),
            })
          } else {
            setStatus({ type: 'error', msg: 'Payment verification failed. If money was deducted, it will be auto-refunded.' })
          }
        },
      })
      rzp.on('payment.failed', (resp) => {
        setStatus({
          type: 'error',
          msg: resp?.error?.description || 'Payment failed. Please try a different method.',
        })
      })
      rzp.open()
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    }
  }

  return (
    <main>
      <PageHero title="Donate Us" image="/images/donate-us.png" />
      <section className="mx-auto max-w-3xl px-4 py-14 lg:px-8">
        <h2 className="font-display text-3xl font-800 text-forest-900">
          Your Contribution Can Change Lives
        </h2>
        <p className="mt-2 text-ink/70">
          Every donation, big or small, helps us continue our mission and create a better tomorrow.
        </p>

        {/* One-time / Monthly toggle */}
        <div className="mt-8 inline-flex rounded-lg bg-forest-50 p-1">
          {['one-time', 'monthly'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-md px-5 py-2 text-sm font-700 capitalize transition ${
                mode === m ? 'bg-forest-900 text-white' : 'text-forest-800'}`}>
              {m.replace('-', ' ')} Donation
            </button>
          ))}
        </div>

        {/* Amount presets */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presets.map(v => (
            <button key={v} onClick={() => { setAmount(v); setCustom('') }}
              className={`rounded-lg border-2 px-4 py-3 font-700 transition ${
                !custom && amount === v
                  ? 'border-forest-900 bg-forest-900 text-white'
                  : 'border-forest-100 bg-white text-forest-900 hover:border-forest-600'}`}>
              ₹{v.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
        <input value={custom} onChange={e => setCustom(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric" placeholder="Other Amount (₹)"
          className="mt-3 w-full rounded-lg border-2 border-forest-100 bg-white px-4 py-3 outline-none focus:border-forest-600 sm:w-64" />

        {/* Donor details for the 80G receipt */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            { key: 'name', label: 'Name of Donor (As per PAN) *', props: { autoComplete: 'name' } },
            { key: 'email', label: 'Email id *', props: { type: 'email', autoComplete: 'email' } },
            { key: 'phone', label: 'Mobile no. *', props: { inputMode: 'tel', autoComplete: 'tel' } },
            { key: 'pan', label: 'PAN (Number) *', props: { maxLength: 10, autoCapitalize: 'characters' } },
            { key: 'aadhar', label: 'Aadhaar (Number)', props: { inputMode: 'numeric', maxLength: 12 } },
            { key: 'address', label: 'Address *', props: { } },
          ].map(({ key, label, props }) => (
            <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
              {key === 'address' ? (
                <textarea
                  {...props}
                  placeholder={label}
                  aria-label={label}
                  aria-invalid={showError(key) ? 'true' : undefined}
                  aria-describedby={showError(key) ? `${key}-error` : undefined}
                  value={donor[key]}
                  onChange={e => setDonor({ ...donor, [key]: e.target.value })}
                  onBlur={() => markTouched(key)}
                  className={`w-full h-24 resize-none ${fieldClass(key)}`}
                />
              ) : (
                <input
                  {...props}
                  placeholder={label}
                  aria-label={label}
                  aria-invalid={showError(key) ? 'true' : undefined}
                  aria-describedby={showError(key) ? `${key}-error` : undefined}
                  value={donor[key]}
                  onChange={e =>
                    setDonor({ ...donor, [key]: key === 'pan' ? e.target.value.toUpperCase() : e.target.value })
                  }
                  onBlur={() => markTouched(key)}
                  className={`w-full ${fieldClass(key)}`}
                />
              )}
              {showError(key) && (
                <p id={`${key}-error`} role="alert" className="mt-1.5 text-xs font-600 text-red-600">
                  {showError(key)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="mt-6 space-y-3">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={options.taxExemption} onChange={e => setOptions({ ...options, taxExemption: e.target.checked })} />
            <div>
              <div className="font-700">I want 80G tax benefit</div>
              <div className="text-sm text-ink/70">Get tax deduction under Section 80G</div>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <input type="checkbox" checked={options.isGift} onChange={e => setOptions({ ...options, isGift: e.target.checked })} />
            <div>
              <div className="font-700">This is a gift for someone else</div>
              <div className="text-sm text-ink/70">Adopting this tree on behalf of another person</div>
            </div>
          </label>

        </div>

        <button onClick={payNow}
          className="mt-8 w-full rounded-lg bg-saffron-500 px-8 py-4 font-display text-lg font-800 text-white transition hover:bg-saffron-600 sm:w-auto">
          DONATE ₹{(finalAmount || 0).toLocaleString('en-IN')} NOW
        </button>
        <p className="mt-3 text-xs text-ink/60">
          Pay securely via UPI, Credit / Debit Card, NetBanking, Wallets or EMI — powered by Razorpay.
        </p>

        {status && (
          <div role="status" className={`mt-4 rounded-lg px-4 py-3 text-sm font-600 ${
            status.type === 'success' ? 'bg-forest-50 text-forest-800'
            : status.type === 'error' ? 'bg-red-50 text-red-700'
            : 'bg-forest-50 text-forest-800'}`}>
            {status.msg}
            {status.certUrl && (
              <a href={status.certUrl} target="_blank" rel="noreferrer"
                className="mt-2 inline-block font-700 text-forest-900 underline">
                Download your appreciation certificate →
              </a>
            )}
          </div>
        )}

        {/* Donation Impact */}
        <div className="mt-12" id="impact">
          <h3 className="font-display text-2xl font-800 text-forest-900">Where Your Donation Goes</h3>
          <p className="mt-2 text-sm text-ink/70">
            An indication of what each amount can support. Actual allocation depends on
            the campaign you choose.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {impact.map(i => (
              <div key={i.amount} className="rounded-xl border-2 border-forest-100 p-5">
                <p className="font-display text-xl font-800 text-forest-900">₹{i.amount.toLocaleString('en-IN')}</p>
                <p className="mt-1 text-sm text-ink/70">{i.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-12 grid grid-cols-2 gap-6 rounded-xl bg-white p-6 ring-1 ring-forest-100 lg:grid-cols-4">
          {/* Fixed icon row height keeps every caption starting on the same line */}
          {trust.map(({ Icon, title }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <Icon className="h-8 w-8 text-forest" />
              <p className="mt-3 text-xs font-600 leading-relaxed text-ink/75">{title}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
