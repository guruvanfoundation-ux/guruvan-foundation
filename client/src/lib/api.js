const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

/* Donations — Razorpay Checkout covers UPI, cards, netbanking and wallets */
export const createDonationOrder = (payload) =>
  request('/api/donations/order', { method: 'POST', body: JSON.stringify(payload) })

export const verifyDonation = (payload) =>
  request('/api/donations/verify', { method: 'POST', body: JSON.stringify(payload) })

/* Campaigns, volunteers, contact */
export const fetchCampaigns = () => request('/api/campaigns')
export const joinVolunteer = (payload) =>
  request('/api/volunteers', { method: 'POST', body: JSON.stringify(payload) })
export const sendContact = (payload) =>
  request('/api/contact', { method: 'POST', body: JSON.stringify(payload) })

export const api = { createDonationOrder, verifyDonation, fetchCampaigns, joinVolunteer, sendContact }
export default api
