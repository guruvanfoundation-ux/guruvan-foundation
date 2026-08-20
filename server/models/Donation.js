import mongoose from 'mongoose'

const donationSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, unique: true },        // e.g. GF-2026-000123
    mode: { type: String, enum: ['one-time', 'monthly'], default: 'one-time' },
    amount: { type: Number, required: true },          // in INR rupees
    currency: { type: String, default: 'INR' },
    donor: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      pan: String,                                     // needed for 80G receipt
      aadhar: String,
      address: String,
      anonymous: { type: Boolean, default: false },    // hide from public recent-donors list
    },
    options: {
      taxExemption: { type: Boolean, default: false },
      isGift: { type: Boolean, default: false },
      showName: { type: Boolean, default: true },
    },
    razorpay: {
      orderId: String,
      paymentId: String,
      signatureVerified: { type: Boolean, default: false },
      method: String,                                  // upi / card / netbanking / wallet
    },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    receiptEmailedAt: Date,
  },
  { timestamps: true }
)

donationSchema.pre('save', async function () {
  if (!this.receiptNo) {
    const year = new Date().getFullYear()
    const count = await this.constructor.countDocuments()
    this.receiptNo = `GF-${year}-${String(count + 1).padStart(6, '0')}`
  }
})

export default mongoose.model('Donation', donationSchema)
