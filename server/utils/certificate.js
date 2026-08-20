import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import fontkit from 'fontkit'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const ASSETS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets')
const LOGO = path.join(ASSETS, 'logo-full.png')
const SCRIPT_FONT = path.join(ASSETS, 'fonts', 'GreatVibes-Regular.ttf')
const SIGN_IMG = path.join(ASSETS, 'main_sign.jpeg')

const GREEN = '#14532D'
const GREEN_DEEP = '#0E3B21'
const GREEN_MID = '#2C6E49'
const GOLD = '#C9A227'
const GOLD_LIGHT = '#E3CE8C'
const CREAM = '#FBF9F2'
const INK = '#2A2A2A'
const MUTED = '#6B6B6B'

const ORG = {
  meta: 'Section 8 Non-Profit  ·  CIN U85500GJ2026NPL179944',
  address: 'Dalwada, Palanpur, Banaskantha - 385515, Gujarat, India',
}

/* The calligraphic face is drawn as outlines rather than embedded as a font:
   a donor's name must never fall back to tofu in someone's PDF reader. */
let scriptFace = null
try {
  if (fs.existsSync(SCRIPT_FONT)) scriptFace = fontkit.openSync(SCRIPT_FONT)
} catch { scriptFace = null }

function scriptWidth(text, size) {
  const run = scriptFace.layout(text)
  return (run.advanceWidth * size) / scriptFace.unitsPerEm
}

/** Centred calligraphic text, painted as vector paths. Falls back to an italic serif. */
function scriptText(doc, text, { size, cx, baseline, color, maxWidth }) {
  if (!scriptFace) {
    doc.font('Times-BoldItalic').fontSize(size * 0.8).fillColor(color)
      .text(text, cx - (maxWidth || 400) / 2, baseline - size * 0.8,
        { width: maxWidth || 400, align: 'center', lineBreak: false })
    return
  }
  let fitted = size
  if (maxWidth && scriptWidth(text, size) > maxWidth) {
    fitted = size * (maxWidth / scriptWidth(text, size))
  }
  const run = scriptFace.layout(text)
  const scale = fitted / scriptFace.unitsPerEm
  let x = cx - (run.advanceWidth * scale) / 2

  doc.save().fillColor(color)
  run.glyphs.forEach((glyph, i) => {
    const d = glyph.path.toSVG()
    if (d) {
      doc.save()
      doc.translate(x + (run.positions[i].xOffset || 0) * scale, baseline)
      doc.scale(scale, -scale)
      doc.path(d).fill()
      doc.restore()
    }
    x += run.positions[i].xAdvance * scale
  })
  doc.restore()
}

/** Text set around a circle, one glyph at a time — used on the seal. */
function circularText(doc, text, { cx, cy, radius, size, color, startAngle, sweep, flip = false }) {
  doc.font('Helvetica-Bold').fontSize(size).fillColor(color)
  const step = sweep / (text.length - 1)
  text.split('').forEach((ch, i) => {
    const angle = startAngle + step * i
    doc.save()
    doc.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    doc.rotate((angle * 180) / Math.PI + (flip ? -90 : 90), { origin: [0, 0] })
    doc.text(ch, -size, -size / 2, { width: size * 2, align: 'center', lineBreak: false })
    doc.restore()
  })
}

/** Deep-green page, cream panel, gold sweeps in opposite corners, green footer band. */
function background(doc, W, H) {
  doc.rect(0, 0, W, H).fill(GREEN_DEEP)
  doc.roundedRect(14, 14, W - 28, H - 28, 6).fill(CREAM)

  // Top-left sweep
  doc.save()
  doc.moveTo(14, 14).lineTo(250, 14).bezierCurveTo(130, 52, 52, 130, 14, 250).closePath().fill(GREEN)
  doc.restore()
  doc.lineWidth(2.2).strokeColor(GOLD)
  doc.moveTo(282, 14).bezierCurveTo(150, 56, 58, 148, 14, 282).stroke()
  doc.lineWidth(0.9).strokeColor(GOLD_LIGHT)
  doc.moveTo(306, 14).bezierCurveTo(168, 66, 70, 166, 14, 306).stroke()

  // Bottom-right sweep, tied into the footer band
  doc.save()
  doc.moveTo(W - 14, H - 250).bezierCurveTo(W - 52, H - 130, W - 130, H - 52, W - 250, H - 14)
    .lineTo(W - 14, H - 14).closePath().fill(GREEN)
  doc.restore()
  doc.lineWidth(2.2).strokeColor(GOLD)
  doc.moveTo(W - 14, H - 282).bezierCurveTo(W - 58, H - 148, W - 150, H - 56, W - 282, H - 14).stroke()
  doc.lineWidth(0.9).strokeColor(GOLD_LIGHT)
  doc.moveTo(W - 14, H - 306).bezierCurveTo(W - 70, H - 166, W - 168, H - 66, W - 306, H - 14).stroke()

  // Keylines and corner brackets
  doc.lineWidth(1.2).strokeColor(GOLD).roundedRect(30, 30, W - 60, H - 60, 3).stroke()
  doc.lineWidth(0.4).strokeColor(GOLD).roundedRect(36, 36, W - 72, H - 72, 2).stroke()
  const bracket = (x, y, sx, sy) => {
    doc.save().lineWidth(1.2).strokeColor(GOLD)
    doc.moveTo(x + 26 * sx, y).lineTo(x, y).lineTo(x, y + 26 * sy).stroke()
    doc.moveTo(x + 19 * sx, y + 7 * sy).lineTo(x + 7 * sx, y + 7 * sy).lineTo(x + 7 * sx, y + 19 * sy).stroke()
    doc.restore()
  }
  bracket(48, 48, 1, 1)
  bracket(W - 48, 48, -1, 1)
  bracket(48, H - 52, 1, -1)
  bracket(W - 48, H - 52, -1, -1)

  // Footer band last, so it sits cleanly over the keyline and the corner sweeps
  doc.save()
  doc.moveTo(14, H - 14).lineTo(14, H - 32)
    .bezierCurveTo(W * 0.3, H - 52, W * 0.7, H - 52, W - 14, H - 32)
    .lineTo(W - 14, H - 14).closePath().fill(GREEN)
  doc.restore()
  doc.save().lineWidth(1).strokeColor(GOLD)
  doc.moveTo(14, H - 32).bezierCurveTo(W * 0.3, H - 52, W * 0.7, H - 52, W - 14, H - 32).stroke()
  doc.restore()
}

/** Gold rosette on a ribbon, hung from the top edge. */
function seal(doc, cx, cy, scale = 1) {
  const s = Number(scale) || 1
  doc.save()
  doc.fillColor(GREEN).rect(cx - 26 * s, 14, 52 * s, cy - 14 + 70 * s).fill()
  doc.fillColor(GREEN_DEEP)
  doc.moveTo(cx - 26 * s, cy + 56 * s).lineTo(cx, cy + 40 * s).lineTo(cx + 26 * s, cy + 56 * s)
    .lineTo(cx + 26 * s, cy + 70 * s).lineTo(cx, cy + 54 * s).lineTo(cx - 26 * s, cy + 70 * s).closePath().fill()
  doc.restore()

  const teeth = Math.max(12, Math.round(30 * s))
  doc.save().fillColor(GOLD)
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2
    doc.circle(cx + Math.cos(a) * (39 * s), cy + Math.sin(a) * (39 * s), 5 * s).fill()
  }
  doc.circle(cx, cy, 39 * s).fill()
  doc.circle(cx, cy, 34 * s).fill(GOLD_LIGHT)
  doc.circle(cx, cy, 30 * s).fill(GOLD)
  doc.circle(cx, cy, 26 * s).fill(CREAM)
  doc.restore()

  circularText(doc, 'TOGETHER FOR A', {
    cx, cy, radius: 21 * s, size: 4.4 * s, color: GREEN,
    startAngle: -Math.PI * 0.92, sweep: Math.PI * 0.84,
  })
  circularText(doc, 'GREENER TOMORROW', {
    cx, cy, radius: 21 * s, size: 4.4 * s, color: GREEN,
    startAngle: Math.PI * 0.9, sweep: -Math.PI * 0.8, flip: true,
  })

  doc.save().translate(cx, cy + 1 * s)
  doc.fillColor(GREEN_MID)
  doc.circle(0, -4 * s, 4.4 * s).fill()
  doc.circle(-5.4 * s, 0, 3.9 * s).fill()
  doc.circle(5.4 * s, 0, 3.9 * s).fill()
  doc.circle(0, 3 * s, 4.2 * s).fill()
  doc.lineWidth(1.4 * s).strokeColor(GREEN).moveTo(0, 3 * s).lineTo(0, 10 * s).stroke()
  doc.restore()
}

/** Gold rule with a diamond at its centre. */
function flourish(doc, cx, y, halfWidth) {
  doc.save().lineWidth(0.8).strokeColor(GOLD)
  doc.moveTo(cx - halfWidth, y).lineTo(cx - 12, y).stroke()
  doc.moveTo(cx + 12, y).lineTo(cx + halfWidth, y).stroke()
  doc.fillColor(GOLD)
  doc.moveTo(cx, y - 4).lineTo(cx + 5, y).lineTo(cx, y + 4).lineTo(cx - 5, y).closePath().fill()
  doc.circle(cx - 9, y, 1.3).fill()
  doc.circle(cx + 9, y, 1.3).fill()
  doc.restore()
}

function pillar(doc, cx, y, title, subtitle, draw) {
  doc.save()
  doc.circle(cx, y, 17).fill('#E4EEE2')
  doc.translate(cx, y)
  draw(doc)
  doc.restore()
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(GREEN)
    .text(title, cx - 95, y + 26, { width: 190, align: 'center', characterSpacing: 0.5 })
  doc.font('Helvetica').fontSize(7).fillColor(MUTED)
    .text(subtitle, cx - 95, y + 37, { width: 190, align: 'center' })
}

const leafMark = (doc) => {
  doc.fillColor(GREEN_MID)
  doc.moveTo(0, 6).bezierCurveTo(-1, -2, 3, -6, 9, -8).bezierCurveTo(9, 0, 5, 5, 0, 6).fill()
  doc.moveTo(0, 6).bezierCurveTo(1, -1, -3, -5, -9, -7).bezierCurveTo(-9, 1, -5, 5, 0, 6).fill()
  doc.lineWidth(1.2).strokeColor(GREEN).moveTo(0, 8).lineTo(0, 1).stroke()
}
const bookMark = (doc) => {
  doc.fillColor(GREEN_MID)
  doc.moveTo(-9, -6).lineTo(-1, -4).lineTo(-1, 7).lineTo(-9, 5).closePath().fill()
  doc.moveTo(9, -6).lineTo(1, -4).lineTo(1, 7).lineTo(9, 5).closePath().fill()
}
const peopleMark = (doc) => {
  doc.fillColor(GREEN_MID)
  doc.circle(0, -5, 3.4).fill()
  doc.moveTo(-5, 7).bezierCurveTo(-5, 0, 5, 0, 5, 7).closePath().fill()
  doc.circle(-8, -3, 2.6).fill()
  doc.circle(8, -3, 2.6).fill()
  doc.moveTo(-11, 7).bezierCurveTo(-11, 1, -5, 1, -5, 7).closePath().fill()
  doc.moveTo(11, 7).bezierCurveTo(11, 1, 5, 1, 5, 7).closePath().fill()
}

/** Laurel sprig; side = 1 draws the left-hand branch, -1 mirrors it. */
function laurel(doc, x, y, side) {
  doc.save().translate(x, y).scale(side * 1.35, 1.35)
  doc.lineWidth(1).strokeColor(GREEN_MID)
  doc.moveTo(0, -18).bezierCurveTo(-11, -10, -15, 2, -13, 16).stroke()
  doc.fillColor(GREEN_MID)
  for (let i = 0; i < 5; i++) {
    const t = i / 4
    const bx = -2 - t * 11
    const by = -15 + t * 29
    doc.save().translate(bx, by).rotate(-55 + t * 80, { origin: [0, 0] })
    doc.ellipse(-4, 0, 4.6, 2.2).fill()
    doc.restore()
  }
  doc.restore()
}

/**
 * Donor appreciation certificate — A4 landscape.
 * Resolves to a PDF buffer.
 */
export async function buildDonorCertificate(donation, { baseUrl = '' } = {}) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 })
  const chunks = []
  doc.on('data', (c) => chunks.push(c))
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))))

  const W = doc.page.width
  const H = doc.page.height
  const cx = W / 2
  const code = `GF-DC-${donation.receiptNo}`
  const site = (baseUrl || 'https://guruvanfoundation.org').replace(/\/$/, '')

  background(doc, W, H)

  if (fs.existsSync(LOGO)) doc.image(LOGO, cx - 165, 40, { width: 330 })
  else doc.font('Helvetica-Bold').fontSize(30).fillColor(GREEN).text('GURUVAN FOUNDATION', 0, 60, { align: 'center' })

  // smaller seal to avoid cropping near the right edge
  seal(doc, W - 112, 96, 0.5)
  flourish(doc, cx, 172, 80)

  doc.font('Times-Bold').fontSize(38).fillColor(GREEN)
    .text('CERTIFICATE', 0, 184, { align: 'center', characterSpacing: 5 })

  doc.font('Helvetica').fontSize(13).fillColor(GREEN_MID)
    .text('OF APPRECIATION', 0, 232, { align: 'center', characterSpacing: 4 })
  doc.save().lineWidth(0.8).strokeColor(GOLD)
  doc.moveTo(cx - 185, 238).lineTo(cx - 85, 238).stroke()
  doc.moveTo(cx + 85, 238).lineTo(cx + 185, 238).stroke()
  doc.restore()

  doc.font('Helvetica').fontSize(11.5).fillColor(INK)
    .text('Proudly presented to', 0, 262, { align: 'center' })

  scriptText(doc, donation.donor.name, {
    size: 46, cx, baseline: 316, color: GREEN, maxWidth: W - 260,
  })

  flourish(doc, cx, 340, 320)

  // Citation, with the amount emphasised inline
  const amount = `Rs. ${Number(donation.amount).toLocaleString('en-IN')}`
  const lead = `for a generous ${donation.mode === 'monthly' ? 'monthly ' : ''}contribution of `
  const tail = ' towards Guruvan Foundation.'
  doc.fontSize(11.5).fillColor(INK)
  const leadW = doc.font('Helvetica').widthOfString(lead)
  const amtW = doc.font('Helvetica-Bold').widthOfString(amount)
  const tailW = doc.font('Helvetica').widthOfString(tail)
  const startX = cx - (leadW + amtW + tailW) / 2
  doc.font('Helvetica').text(lead, startX, 358, { lineBreak: false })
  doc.font('Helvetica-Bold').text(amount, startX + leadW, 358, { lineBreak: false })
  doc.font('Helvetica').text(tail, startX + leadW + amtW, 358, { lineBreak: false })
  doc.font('Helvetica').fontSize(11.5).fillColor(INK)
    .text('Your support plants trees, educates children and', 0, 375, { align: 'center' })
    .text('strengthens communities across Gujarat.', 0, 391, { align: 'center' })

  // Three pillars
  const pillarY = 418
  pillar(doc, cx - 205, pillarY, 'PLANTING HOPE', 'Building a Greener Future', leafMark)
  pillar(doc, cx, pillarY, 'EDUCATING MINDS', 'Empowering Young Lives', bookMark)
  pillar(doc, cx + 205, pillarY, 'EMPOWERING COMMUNITIES', 'Creating Lasting Impact', peopleMark)
  doc.save().lineWidth(0.6).strokeColor(GOLD)
  doc.moveTo(cx - 102, pillarY - 16).lineTo(cx - 102, pillarY + 40).stroke()
  doc.moveTo(cx + 102, pillarY - 16).lineTo(cx + 102, pillarY + 40).stroke()
  doc.restore()

  // Signature area — rule and caption first, the scanned stamp laid over them
  const rowY = 496
  const signLineY = rowY + 6
  doc.lineWidth(0.8).strokeColor('#9A9A9A').moveTo(112, signLineY).lineTo(264, signLineY).stroke()
  doc.font('Helvetica').fontSize(8.5).fillColor(INK)
    .text('Authorised Signatory', 112, signLineY + 7, { width: 152, align: 'center' })
  doc.font('Helvetica').fontSize(8).fillColor(MUTED)
    .text('Guruvan Foundation', 112, signLineY + 19, { width: 152, align: 'center' })

  const stickerPath = path.join(ASSETS, 'sign_sticker.jpeg')
  const stampPath = fs.existsSync(stickerPath) ? stickerPath : SIGN_IMG
  if (fs.existsSync(stampPath)) {
    try {
      // centred on the rule, small enough to clear the pillars above and the band below
      doc.image(stampPath, 146, signLineY - 36, { width: 84 })
    } catch {
      scriptText(doc, 'Guruvan', { size: 24, cx: 188, baseline: signLineY - 6, color: GREEN_DEEP, maxWidth: 140 })
    }
  } else {
    scriptText(doc, 'Guruvan', { size: 24, cx: 188, baseline: signLineY - 6, color: GREEN_DEEP, maxWidth: 140 })
  }

  // Receipt number between laurels
  laurel(doc, cx - 76, rowY + 14, 1)
  laurel(doc, cx + 76, rowY + 14, -1)
  doc.font('Helvetica').fontSize(9.5).fillColor(INK)
    .text('Receipt No.', cx - 68, rowY - 4, { width: 136, align: 'center' })
  doc.font('Helvetica-Bold').fontSize(14).fillColor(GREEN)
    .text(donation.receiptNo, cx - 68, rowY + 10, { width: 136, align: 'center' })
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
    .text(new Date(donation.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    }), cx - 68, rowY + 28, { width: 136, align: 'center' })

  // QR + verification details
    // QR + verification details
    const qr = await QRCode.toDataURL(`${site}/verify/${code}`, {
    margin: 0, width: 240, color: { dark: GREEN, light: '#FFFFFF' },
  })
  // Kept left of the bottom-right sweep so the verification text stays on cream
  const qrX = cx + 118
  const qrY = rowY - 12
  doc.save().lineWidth(1).strokeColor(GOLD).rect(qrX - 5, qrY - 5, 56, 56).stroke().restore()
  doc.image(Buffer.from(qr.split(',')[1], 'base64'), qrX, qrY, { width: 46 })
  doc.font('Helvetica').fontSize(8).fillColor(INK)
    .text(`Certificate ID: ${code}`, qrX + 62, qrY, { width: 200, lineBreak: false })
  doc.fillColor(MUTED).text('Verify this certificate at:', qrX + 62, qrY + 18, { lineBreak: false })
  doc.fillColor(GREEN_MID).text(`${site.replace(/^https?:\/\//, '')}/verify`, qrX + 62, qrY + 31, { lineBreak: false })

  // Footer band
  doc.font('Helvetica').fontSize(8.5).fillColor(CREAM)
    .text(ORG.meta, 0, H - 38, { align: 'center' })
    .text(ORG.address, 0, H - 25, { align: 'center' })

  // (Certificate: TAX EXEMPTION box intentionally omitted here)

  doc.end()
  return done
}

export default buildDonorCertificate
