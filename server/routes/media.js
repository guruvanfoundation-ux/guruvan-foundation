import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Media from '../models/Media.js'
import { requireAdmin } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const router = Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase()
    cb(null, `${Date.now()}-${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpe?g|png|webp|gif|avif)$/.test(file.mimetype)) cb(null, true)
    else cb(new Error('Only image files are allowed.'))
  },
})

// Public: fetch images for a slot (e.g. GET /api/media?slot=gallery)
router.get('/', async (req, res) => {
  const filter = req.query.slot ? { slot: req.query.slot } : {}
  const media = await Media.find(filter).sort('-createdAt')
  res.json(media)
})

// Admin: upload a photo into a slot
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' })
  const slot = (req.body.slot || 'gallery').trim()
  const media = await Media.create({
    slot,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    caption: req.body.caption?.trim(),
    uploadedBy: req.user?.email,
  })
  res.status(201).json(media)
})

// Admin: delete a photo (removes the file from disk too)
router.delete('/:id', requireAdmin, async (req, res) => {
  const media = await Media.findById(req.params.id)
  if (!media) return res.status(404).json({ error: 'Image not found.' })
  const filePath = path.join(UPLOAD_DIR, media.filename)
  fs.promises.unlink(filePath).catch(() => {}) // ignore if already gone
  await media.deleteOne()
  res.json({ success: true })
})

export default router
