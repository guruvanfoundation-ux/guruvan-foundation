import { Router } from 'express'
import Volunteer from '../models/Volunteer.js'
import { requireAdmin, requireSuperAdmin } from '../middleware/auth.js'
import {
  buildVolunteerIdCard,
  buildVolunteerCertificate,
} from '../utils/documents.js'

const router = Router()

const baseUrl = (req) => process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`

// Sequential volunteer number, e.g. GF-V-000042
async function nextVolunteerId() {
  const count = await Volunteer.countDocuments({ volunteerId: { $exists: true, $ne: null } })
  return `GF-V-${String(count + 1).padStart(6, '0')}`
}

// Public: volunteer / internship / partnership sign-up
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, city, interest, message, bloodGroup, emergencyContact } = req.body
    if (!name || !email || !phone)
      return res.status(400).json({ error: 'Name, email and phone are required.' })
    await Volunteer.create({ name, email, phone, city, interest, message, bloodGroup, emergencyContact })
    res.json({ success: true, message: 'Thank you for signing up. Our team will be in touch.' })
  } catch (err) {
    res.status(500).json({ error: 'Could not submit. Please try again.' })
  }
})

// Public directory: deliberately exclude contact details and private application notes.
router.get('/directory', async (_req, res) => {
  const volunteers = await Volunteer.find({ status: 'approved' })
    .sort('name')
    .select('name city interest volunteerId approvedAt -_id')
  res.json(volunteers)
})

// Admin: list volunteers
router.get('/', requireAdmin, async (_req, res) => {
  const volunteers = await Volunteer.find().sort('-createdAt')
  res.json(volunteers)
})

// Admin: approve -> assign a volunteer ID (unlocks the ID card + certificate)
router.post('/:id/approve', requireAdmin, async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id)
  if (!volunteer) return res.status(404).json({ error: 'Volunteer not found.' })
  if (volunteer.status !== 'approved') {
    volunteer.status = 'approved'
    volunteer.approvedAt = new Date()
    volunteer.rejectedAt = undefined
    if (!volunteer.volunteerId) volunteer.volunteerId = await nextVolunteerId()
    await volunteer.save()
  }
  res.json({ success: true, volunteerId: volunteer.volunteerId })
})

// Admin: reject an application while retaining its record for audit/history.
router.post('/:id/reject', requireAdmin, async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id)
  if (!volunteer) return res.status(404).json({ error: 'Volunteer not found.' })
  volunteer.status = 'rejected'
  volunteer.rejectedAt = new Date()
  await volunteer.save()
  res.json({ success: true })
})

// Super-admin: permanently erase an application after explicit UI confirmation.
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  const volunteer = await Volunteer.findByIdAndDelete(req.params.id)
  if (!volunteer) return res.status(404).json({ error: 'Volunteer not found.' })
  res.json({ success: true })
})

// Admin: download the auto-generated ID card (PDF)
router.get('/:id/id-card', requireAdmin, async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id)
  if (volunteer?.status !== 'approved' || !volunteer.volunteerId)
    return res.status(400).json({ error: 'Approve the volunteer first to generate an ID.' })
  const pdf = await buildVolunteerIdCard(volunteer, { baseUrl: baseUrl(req) })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${volunteer.volunteerId}-id-card.pdf"`)
  res.send(pdf)
})

// Admin: download the participation / appreciation certificate (PDF)
router.get('/:id/certificate', requireAdmin, async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id)
  if (volunteer?.status !== 'approved' || !volunteer.volunteerId)
    return res.status(400).json({ error: 'Approve the volunteer first to generate a certificate.' })
  const { project, hours } = req.query
  const pdf = await buildVolunteerCertificate(volunteer, { baseUrl: baseUrl(req), project, hours })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${volunteer.volunteerId}-certificate.pdf"`)
  res.send(pdf)
})

export default router
