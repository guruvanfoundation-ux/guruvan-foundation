import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import donationRoutes from './routes/donations.js'
import campaignRoutes from './routes/campaigns.js'
import volunteerRoutes from './routes/volunteers.js'
import contactRoutes from './routes/contact.js'
import authRoutes from './routes/auth.js'
import mediaRoutes from './routes/media.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))

// Razorpay webhook needs the raw body for signature verification — mount before express.json()
app.use('/api/donations/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

app.use('/api/donations', donationRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/volunteers', volunteerRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/media', mediaRoutes)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api/contact', contactRoutes)
app.get('/api/health', (_req, res) => res.json({ ok: true }))

/**
 * Production: serve the built client from this same process, so the site and
 * the API share one origin — no CORS, and /api/... resolves for the browser
 * exactly as it does behind the Vite proxy in development.
 * Copy client/dist here as server/public before starting.
 */
const CLIENT_DIR = path.join(__dirname, 'public')
if (fs.existsSync(path.join(CLIENT_DIR, 'index.html'))) {
  app.use(express.static(CLIENT_DIR, { maxAge: '1d', index: false }))
  // Anything that is not an API call or an upload is a client-side route
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.sendFile(path.join(CLIENT_DIR, 'index.html'))
  })
} else {
  console.warn('No built client at server/public — serving the API only.')
}

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Unexpected server error.' })
})

const PORT = process.env.PORT || 5000
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on :${PORT}`)))
  .catch((err) => {
    console.error('Mongo connection failed:', err.message)
    process.exit(1)
  })
