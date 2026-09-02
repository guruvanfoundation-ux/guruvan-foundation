// Use the Render service when the public domain only hosts the client bundle.
// A VITE_API_URL value always takes precedence for dedicated deployments.
const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const renderHost = 'guruvan-foundation.onrender.com'
const isRenderHost = typeof window !== 'undefined' && window.location.hostname === renderHost
const BASE = configuredBase || (import.meta.env.PROD && !isRenderHost ? `https://${renderHost}` : '')
export const apiUrl = (path) => `${BASE}${path}`

async function request(path, options = {}) {
  const res = await fetch(apiUrl(path), {
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
export const fetchVolunteerDirectory = () => request('/api/volunteers/directory')
export const sendContact = (payload) =>
  request('/api/contact', { method: 'POST', body: JSON.stringify(payload) })
export const fetchMedia = (slot) => request(slot ? `/api/media?slot=${encodeURIComponent(slot)}` : '/api/media')

export const api = { createDonationOrder, verifyDonation, fetchCampaigns, joinVolunteer, fetchVolunteerDirectory, sendContact, fetchMedia }
export default api
