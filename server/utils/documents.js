import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

// Brand palette — matches the receipt and the site
const GREEN = '#14402b'
const GREEN_MID = '#1B6B3A'
const SAFFRON = '#d97b16'
const INK = '#222222'
const MUTED = '#666666'

const ORG = {
  name: 'GURUVAN FOUNDATION',
  motto: 'EDUCATE  ·  PLANT  ·  EMPOWER',
  meta: 'Section 8 Non-Profit · CIN U85500GJ2026NPL179944',
  address: 'Dalwada, Palanpur, Banaskantha - 385515, Gujarat',
}

function collect(doc) {
  return new Promise((resolve) => {
    const chunks = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.end()
  })
}

async function qrDataUrl(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 240, color: { dark: GREEN, light: '#ffffff' } })
}

/**
 * Volunteer ID card — credit-card proportions on an A6 landscape sheet.
 * Includes a QR that points at the public verification URL.
 */
export async function buildVolunteerIdCard(volunteer, { baseUrl = '' } = {}) {
  const doc = new PDFDocument({ size: [340, 216], margin: 0 }) // ~ ID-1 ratio
  const verifyUrl = `${baseUrl}/verify/volunteer/${volunteer.volunteerId}`
  const qr = await qrDataUrl(verifyUrl)

  // Left band
  doc.rect(0, 0, 110, 216).fill(GREEN)
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(11).text('GURUVAN', 12, 24, { width: 90 })
  doc.fillColor('#cfe3d4').fontSize(6).text('FOUNDATION', 12, 38, { characterSpacing: 1 })
  doc.image(Buffer.from(qr.split(',')[1], 'base64'), 18, 120, { width: 74 })
  doc.fillColor('#cfe3d4').fontSize(5).text('Scan to verify', 18, 196, { width: 74, align: 'center' })

  // Right details
  doc.fillColor(SAFFRON).fontSize(6.5).font('Helvetica-Bold')
     .text('VOLUNTEER ID CARD', 124, 20, { characterSpacing: 1 })
  doc.moveTo(124, 34).lineTo(320, 34).strokeColor('#e0e0e0').stroke()

  const line = (label, value, y) => {
    doc.fillColor(MUTED).font('Helvetica').fontSize(6.5).text(label, 124, y)
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(9).text(value || '—', 124, y + 8, { width: 196 })
  }
  line('NAME', volunteer.name, 44)
  line('VOLUNTEER No.', volunteer.volunteerId, 70)
  line('BLOOD GROUP', volunteer.bloodGroup, 96)
  line('JOINED', new Date(volunteer.createdAt || Date.now()).toLocaleDateString('en-IN'), 122)
  line('EMERGENCY', volunteer.emergencyContact, 148)

  doc.fillColor(MUTED).fontSize(5.5).font('Helvetica')
     .text('This card remains the property of Guruvan Foundation.', 124, 190, { width: 196 })

  return collect(doc)
}

function certificateFrame(doc, heading) {
  const W = doc.page.width
  // outer border
  doc.rect(24, 24, W - 48, doc.page.height - 48).lineWidth(2).strokeColor(GREEN).stroke()
  doc.rect(32, 32, W - 64, doc.page.height - 64).lineWidth(0.5).strokeColor(SAFFRON).stroke()

  doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(24).text(ORG.name, 0, 70, { align: 'center' })
  doc.fillColor(SAFFRON).fontSize(9).text(ORG.motto, { align: 'center', characterSpacing: 2 })
  doc.moveDown(2)
  doc.fillColor(GREEN_MID).fontSize(20).font('Helvetica-Bold').text(heading, { align: 'center' })
  doc.moveDown(0.5)
}

function certificateFooter(doc, { code, verifyUrl }) {
  const y = doc.page.height - 120
  doc.fontSize(9).fillColor(MUTED).font('Helvetica')
  doc.text('_____________________', 90, y)
  doc.text('Authorised Signatory', 90, y + 14)
  doc.text(`Certificate ID: ${code}`, 0, y, { align: 'right', width: doc.page.width - 90 })
  doc.text(verifyUrl, 0, y + 14, { align: 'right', width: doc.page.width - 90 })
  doc.fillColor(MUTED).fontSize(8)
     .text(`${ORG.meta} · ${ORG.address}`, 0, doc.page.height - 70, { align: 'center' })
}

/** Volunteer participation / appreciation certificate (A4 landscape). */
export async function buildVolunteerCertificate(volunteer, { baseUrl = '', project, hours } = {}) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 })
  const code = `GF-VC-${volunteer.volunteerId}`
  const verifyUrl = `${baseUrl}/verify/certificate/${code}`

  certificateFrame(doc, 'Certificate of Appreciation')
  doc.moveDown(1)
  doc.fillColor(INK).font('Helvetica').fontSize(12).text('This certificate is proudly presented to', { align: 'center' })
  doc.moveDown(0.6)
  doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(28).text(volunteer.name, { align: 'center' })
  doc.moveDown(0.6)
  doc.fillColor(INK).font('Helvetica').fontSize(12).text(
    `in grateful recognition of dedicated service as a volunteer with Guruvan Foundation` +
      (project ? `, contributing to ${project}` : '') +
      (hours ? `, and ${hours} hours of committed effort` : '') +
      `, in support of our mission to Educate, Plant and Empower.`,
    140, doc.y, { align: 'center', width: doc.page.width - 280 }
  )
  doc.moveDown(1)
  doc.fillColor(MUTED).fontSize(10).text(`Awarded on ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' })

  certificateFooter(doc, { code, verifyUrl })
  return collect(doc)
}

/* The donor certificate lives in ./certificate.js — it uses the full brand design. */
