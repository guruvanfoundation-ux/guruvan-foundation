import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    // Where on the site this image is used, e.g. "hero", "focus-environment",
    // "volunteers", or "gallery" for the general media gallery.
    slot: { type: String, required: true, trim: true, index: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    caption: { type: String, trim: true },
    uploadedBy: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model('Media', mediaSchema)
