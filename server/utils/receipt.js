import PDFDocument from 'pdfkit'
import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Donation from '../models/Donation.js'
import { buildDonorCertificate } from './certificate.js'

const RECEIPT = {
  green: '#14532D',
  greenDeep: '#0E3B21',
  gold: '#C9A227',
  ink: '#2A2A2A',
  muted: '#6B6B6B',
  line: '#E3EBE0',
  wash: '#F7F9F5',
  tint: '#F1F7F1',
}

/** Colour logo for the white page; falls back to type if the file is absent. */
const RECEIPT_LOGO = path.join(
  path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'logo-full.png'
)
const SIGN_IMG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'main_sign.jpeg')
const STAMP_IMG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sign_sticker.jpeg')

function buildReceiptPdf(donation) {
  return new Promise(resolve => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    const C = RECEIPT
    const W = doc.page.width
    const H = doc.page.height
    const M = 48
    const inner = W - M * 2

    // ---- header: logo left, registration details right ----------------------
    if (fs.existsSync(RECEIPT_LOGO)) {
      doc.image(RECEIPT_LOGO, M, 42, { width: 168 })
    } else {
      doc.fillColor(C.green).font('Helvetica-Bold').fontSize(20).text('GURUVAN FOUNDATION', M, 48)
    }

    doc.font('Helvetica').fontSize(8).fillColor(C.muted)
    doc.text('Section 8 Non-Profit', W - M - 240, 48, { width: 240, align: 'right' })
    doc.text('CIN U85500GJ2026NPL179944', W - M - 240, 60, { width: 240, align: 'right' })
    doc.text('Dalwada, Palanpur, Banaskantha - 385515, Gujarat', W - M - 240, 72, { width: 240, align: 'right' })

    doc.lineWidth(1.5).strokeColor(C.green).moveTo(M, 132).lineTo(W - M, 132).stroke()
    doc.lineWidth(0.6).strokeColor(C.gold).moveTo(M, 136).lineTo(W - M, 136).stroke()

    // ---- title --------------------------------------------------------------
    doc.font('Helvetica-Bold').fontSize(17).fillColor(C.green)
      .text('DONATION RECEIPT', 0, 164, { align: 'center', characterSpacing: 3 })

    // ---- receipt no. / date strip ------------------------------------------
    const stripY = 200
    doc.roundedRect(M, stripY, inner, 46, 5).fill(C.tint)
    const half = inner / 2
    const strip = (label, value, x) => {
      doc.font('Helvetica').fontSize(7.5).fillColor(C.muted)
        .text(label, x + 16, stripY + 11, { characterSpacing: 1 })
      doc.font('Helvetica-Bold').fontSize(12).fillColor(C.green)
        .text(value, x + 16, stripY + 24)
    }
    strip('RECEIPT NO.', donation.receiptNo, M)
    strip('DATE', new Date(donation.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    }), M + half)
    doc.lineWidth(0.8).strokeColor('#D8E6D8')
      .moveTo(M + half, stripY + 10).lineTo(M + half, stripY + 36).stroke()

    // ---- details table ------------------------------------------------------
    const formattedDate = new Date(donation.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    const rows = [
      ['Date of receipt', formattedDate],
      ['Name of Donor (As per PAN)', donation.donor.name],
      ['Address', donation.donor.address || '—'],
      ['PAN (Number)', donation.donor.pan || '—'],
      ['Aadhar (Number)', donation.donor.aadhar || '—'],
      ['Amount', `Rs. ${Number(donation.amount).toLocaleString('en-IN')}`],
    ]

    const tableY = stripY + 74
    const headH = 26
    const hasAmountRow = rows.some(r => r[0] === 'Amount')
    const amountH = hasAmountRow ? 0 : 40

    // Measure each row's required height (address can be multi-line) and build heights array
    const labelW = 150
    const valueW = inner - 186
    const rowHeights = []
    doc.font('Helvetica').fontSize(9.5)
    for (let i = 0; i < rows.length; i++) {
      const [, value] = rows[i]
      // value height measured with bold font used for values
      doc.font('Helvetica-Bold').fontSize(9.5)
      const valH = doc.heightOfString(String(value), { width: valueW })
      const h = Math.max(28, valH + 14) // padding
      rowHeights.push(h)
    }
    const tableH = headH + rowHeights.reduce((a, b) => a + b, 0) + amountH

    doc.save()
    doc.roundedRect(M, tableY, inner, tableH, 5).clip()

    doc.rect(M, tableY, inner, headH).fill(C.green)
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF')
      .text('DONATION DETAILS', M + 16, tableY + 9, { characterSpacing: 1.5 })

    // Render rows with computed heights
    let cursorY = tableY + headH
    for (let i = 0; i < rows.length; i++) {
      const [label, value] = rows[i]
      const h = rowHeights[i]
      const y = cursorY
      const isAmount = rows[i][0] === 'Amount'
      if (isAmount) doc.rect(M, y, inner, h).fill(C.tint)
      else if (i % 2 === 1) doc.rect(M, y, inner, h).fill(C.wash)
      doc.font('Helvetica').fontSize(9.5).fillColor(C.muted)
        .text(label, M + 16, y + 9.5, { width: labelW })
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.ink)
        .text(String(value), M + 170, y + 9.5, { width: valueW, align: 'right' })
      doc.lineWidth(0.5).strokeColor(C.line)
        .moveTo(M, y + h).lineTo(M + inner, y + h).stroke()
      cursorY += h
    }

    // amount, given its own weight at the foot of the table
    const amtY = tableY + headH + rowHeights.reduce((a, b) => a + b, 0)
    if (!hasAmountRow) {
      doc.rect(M, amtY, inner, amountH).fill(C.tint)
      doc.font('Helvetica-Bold').fontSize(10).fillColor(C.green)
        .text('AMOUNT RECEIVED', M + 16, amtY + 15, { characterSpacing: 1 })
      doc.font('Helvetica-Bold').fontSize(16).fillColor(C.green)
        .text(`Rs. ${Number(donation.amount).toLocaleString('en-IN')}`, M + 170, amtY + 12, {
          width: inner - 186, align: 'right',
        })
    }
    doc.restore()
    doc.lineWidth(0.8).strokeColor(C.line).roundedRect(M, tableY, inner, tableH, 5).stroke()

    // ---- 80G note -----------------------------------------------------------
    const noteY = tableY + tableH + 26
    const note =
      process.env.ORG_80G_NUMBER && process.env.ORG_80G_NUMBER !== 'PENDING_80G_APPROVAL'
        ? `This donation is eligible for deduction under Section 80G of the Income Tax Act, 1961 (Approval No. ${process.env.ORG_80G_NUMBER}). Please retain this receipt for your records.`
        : '80G approval is currently under process. This receipt formally acknowledges your contribution; we will write to you once approval comes through.'
    // measure note height so registration block sits beneath it
    doc.font('Helvetica').fontSize(8.5)
    const noteHeight = doc.heightOfString(note, { width: inner - 32 })
    const noteBoxH = Math.max(52, 20 + noteHeight)
    doc.roundedRect(M, noteY, inner, noteBoxH, 5).fillAndStroke('#FFFFFF', C.line)
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.green)
      .text('TAX EXEMPTION', M + 16, noteY + 12, { characterSpacing: 1 })
    doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
      .text(note, M + 16, noteY + 25, { width: inner - 32 })

    // NGO registration details / tax validity — place below the note box on the left
    const regNo = process.env.ORG_UIN || 'AANCG1787CE20261'
    const taxYears = process.env.ORG_TAX_YEARS || 'From TY 2026-27 to TY 2028-29'
    const regY = noteY + noteBoxH + 12
    const regX = M + 16
    const regW = Math.min(320, inner - 32)
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.green)
      .text('REGISTRATION', regX, regY, { width: regW, align: 'left' })
    doc.font('Helvetica').fontSize(8).fillColor(C.muted)
      .text(`UIN: ${regNo}`, regX, regY + 13, { width: regW, align: 'left' })
    doc.font('Helvetica').fontSize(8).fillColor(C.muted)
      .text(taxYears, regX, regY + 26, { width: regW, align: 'left' })

    // ---- signature ---------------------------------------------------------
    // Stamp sits above the rule, caption below it, so nothing is obscured.
    const signY = regY + 96
    const signW = 160
    const signX = W - M - signW
    const stampPath = fs.existsSync(STAMP_IMG) ? STAMP_IMG : SIGN_IMG
    if (fs.existsSync(stampPath)) {
      try {
        doc.image(stampPath, signX + (signW - 78) / 2, signY - 82, { width: 78 })
      } catch {
        // a missing or unreadable stamp just leaves the rule to be signed by hand
      }
    }
    doc.lineWidth(0.8).strokeColor(C.muted).moveTo(signX, signY).lineTo(W - M, signY).stroke()
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.ink)
      .text('Authorised Signatory', signX, signY + 8, { width: signW, align: 'center' })
    doc.font('Helvetica').fontSize(8).fillColor(C.muted)
      .text('Guruvan Foundation', signX, signY + 20, { width: signW, align: 'center' })
    doc.font('Helvetica').fontSize(8).fillColor(C.muted)
      .text('This is a computer-generated receipt.', M, signY + 8, { width: 220 })

    // ---- footer band --------------------------------------------------------
    doc.rect(0, H - 64, W, 64).fill(C.greenDeep)
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF')
      .text('Thank you for supporting Guruvan Foundation', 0, H - 46, { align: 'center' })
    doc.font('Helvetica').fontSize(8).fillColor('#C9D8C9')
      .text('guruvanfoundation@gmail.com  ·  +91 90234 35636  ·  guruvanfoundation.org', 0, H - 31, {
        align: 'center',
      })

    doc.end()
  })
}

export { buildReceiptPdf }

/**
 * What a gift of this size pays for. These mirror the tiers shown on the donate
 * page, so the email never promises something the site does not.
 */
function impactFor(amount) {
  if (amount >= 5000) {
    return {
      title: 'A day of a community health camp',
      detail:
        'A gift this size can underwrite a day of a health camp — check-ups, screening and ' +
        'medicines for families who would otherwise go without them.',
    }
  }
  if (amount >= 1000) {
    return {
      title: 'A full learning kit for a child',
      detail:
        'Books, a bag and stationery for one student — so no family has to choose between ' +
        'school supplies and the weekly groceries.',
    }
  }
  if (amount >= 500) {
    return {
      title: 'Saplings, planted and looked after',
      detail:
        'This plants a patch of saplings and pays for their aftercare through the first ' +
        'season — the months that decide whether a young tree survives at all.',
    }
  }
  return {
    title: 'The next drive on the ground',
    detail:
      'Every contribution goes straight into the next plantation drive, school kit or ' +
      'health camp. Steady giving is what keeps the work going.',
  }
}

const LOGO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'logo-white.png')
const TAGLINE = 'Together for a Greener, Healthier & Educated Tomorrow'

const esc = (v) =>
  String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Emails the donor their tax receipt and appreciation certificate, along with a
 * note on what their gift pays for, then stamps receiptEmailedAt so the webhook
 * never sends a duplicate.
 */
export async function emailDonorDocuments(donation, { baseUrl = '' } = {}) {
  // Without mail credentials nodemailer falls back to localhost:587 and throws
  // ECONNREFUSED. The donation is already saved, so skip the mail and say so.
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      `Receipt ${donation.receiptNo} not emailed: SMTP is not configured ` +
      `(set SMTP_HOST, SMTP_USER and SMTP_PASS in server/.env).`
    )
    return
  }

  const site = (baseUrl || process.env.PUBLIC_URL || 'https://guruvanfoundation.org').replace(/\/$/, '')
  const [receiptPdf, certificatePdf] = await Promise.all([
    buildReceiptPdf(donation),
    buildDonorCertificate(donation, { baseUrl: site }),
  ])

  const name = donation.donor.name
  const firstName = String(name || '').trim().split(/\s+/)[0] || name
  const monthly = donation.mode === 'monthly'
  const figure = Number(donation.amount).toLocaleString('en-IN')
  const impact = impactFor(Number(donation.amount))
  const dated = new Date(donation.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const taxNote =
    process.env.ORG_80G_NUMBER && process.env.ORG_80G_NUMBER !== 'PENDING_80G_APPROVAL'
      ? `Your donation is eligible for deduction under Section 80G (Approval No. ${process.env.ORG_80G_NUMBER}). Keep the attached receipt for your records.`
      : '80G approval is currently under process. The attached receipt formally acknowledges your contribution, and we will write to you once approval comes through.'

  const port = Number(process.env.SMTP_PORT || 465)
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 is implicit TLS; 587 upgrades with STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  // Plain-text alternative — some donors read mail in clients that show only this
  const text = [
    `Dear ${firstName},`,
    ``,
    `Thank you. Your ${monthly ? 'monthly ' : ''}gift of Rs. ${figure} has reached Guruvan Foundation safely.`,
    ``,
    `WHAT YOUR GIFT SUPPORTS — ${impact.title}`,
    impact.detail,
    `Where it goes depends on the campaign you chose and where the need is greatest at the time.`,
    ``,
    `YOUR DONATION`,
    `  Amount:      Rs. ${figure}${monthly ? ' per month' : ''}`,
    `  Receipt no.: ${donation.receiptNo}`,
    `  Date:        ${dated}`,
    ``,
    `ATTACHED`,
    `  1. Your donation receipt (${donation.receiptNo})`,
    `  2. Your Certificate of Appreciation`,
    ``,
    taxNote,
    ``,
    `You can follow the drives your gift supports at ${site} and on Instagram @guruvan_foundation.`,
    ``,
    `With gratitude,`,
    `Guruvan Foundation`,
    `Educate . Plant . Empower`,
    site,
  ].join('\n')

  // The logo travels with the message; clients that block remote images still show it.
  const hasLogo = fs.existsSync(LOGO)
  const logoTag = hasLogo
    ? '<img src="cid:guruvanlogo" width="210" alt="Guruvan Foundation" style="display:block;margin:0 auto;width:210px;max-width:70%;height:auto;border:0">'
    : '<div style="font-size:22px;font-weight:bold;color:#FFFFFF;letter-spacing:1px">GURUVAN FOUNDATION</div>'

  // Table-based layout with inline styles — the only thing mail clients render reliably
  const html = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EC;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden">

        <tr><td style="background:#14532D;padding:26px 32px 22px;text-align:center">
          ${logoTag}
          <div style="font-size:12px;color:#E3CE8C;margin-top:12px">${esc(TAGLINE)}</div>
        </td></tr>

        <tr><td style="padding:32px 32px 8px">
          <p style="margin:0 0 16px;font-size:15px;color:#2A2A2A">Dear ${esc(firstName)},</p>
          <p style="margin:0 0 16px;font-size:20px;line-height:1.4;color:#14532D;font-weight:bold">
            Thank you — your gift is already at work.
          </p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4A4A4A">
            Your ${monthly ? 'monthly ' : ''}contribution of <strong style="color:#14532D">&#8377;${esc(figure)}</strong>
            has reached us safely. Here is what a gift of this size pays for.
          </p>
        </td></tr>

        <tr><td style="padding:0 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F7F1;border-left:4px solid #2C6E49;border-radius:6px">
            <tr><td style="padding:18px 20px">
              <div style="font-size:15px;font-weight:bold;color:#14532D">${esc(impact.title)}</div>
              <div style="font-size:14px;line-height:1.7;color:#4A4A4A;margin-top:6px">${esc(impact.detail)}</div>
            </td></tr>
          </table>
          <p style="margin:12px 0 24px;font-size:12px;color:#8A8A8A">
            Where it goes depends on the campaign you chose and where the need is greatest at the time.
          </p>
        </td></tr>

        <tr><td style="padding:0 32px 8px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E3EBE0;border-radius:6px">
            <tr>
              <td style="padding:14px 20px;font-size:13px;color:#6B6B6B;border-bottom:1px solid #E3EBE0">Amount</td>
              <td style="padding:14px 20px;font-size:14px;color:#14532D;font-weight:bold;text-align:right;border-bottom:1px solid #E3EBE0">&#8377;${esc(figure)}${monthly ? ' / month' : ''}</td>
            </tr>
            <tr>
              <td style="padding:14px 20px;font-size:13px;color:#6B6B6B;border-bottom:1px solid #E3EBE0">Receipt no.</td>
              <td style="padding:14px 20px;font-size:14px;color:#2A2A2A;text-align:right;border-bottom:1px solid #E3EBE0">${esc(donation.receiptNo)}</td>
            </tr>
            <tr>
              <td style="padding:14px 20px;font-size:13px;color:#6B6B6B">Date</td>
              <td style="padding:14px 20px;font-size:14px;color:#2A2A2A;text-align:right">${esc(dated)}</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 32px 0">
          <div style="font-size:15px;font-weight:bold;color:#14532D;margin-bottom:10px">Attached to this email</div>
          <div style="font-size:14px;line-height:1.8;color:#4A4A4A">
            Your <strong>donation receipt</strong> (${esc(donation.receiptNo)})<br>
            Your <strong>Certificate of Appreciation</strong>
          </div>
          <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#6B6B6B">${esc(taxNote)}</p>
        </td></tr>

        <tr><td style="padding:28px 32px 32px" align="center">
          <a href="${site}/our-work" style="display:inline-block;background:#14532D;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:1px;padding:14px 28px;border-radius:6px">
            SEE THE WORK YOU ARE FUNDING
          </a>
        </td></tr>

        <tr><td style="background:#0E3B21;padding:22px 32px;text-align:center">
          <div style="font-size:13px;color:#FFFFFF;font-weight:bold">Guruvan Foundation</div>
          <div style="font-size:10px;color:#E3CE8C;letter-spacing:2px;margin-top:4px">EDUCATE &middot; PLANT &middot; EMPOWER</div>
          <div style="font-size:11px;color:#C9D8C9;line-height:1.8;margin-top:6px">
            Section 8 Non-Profit &middot; CIN U85500GJ2026NPL179944<br>
            Dalwada, Palanpur, Banaskantha - 385515, Gujarat<br>
            <a href="${site}" style="color:#E3CE8C;text-decoration:none">${esc(site.replace(/^https?:\/\//, ''))}</a>
            &nbsp;&middot;&nbsp;
            <a href="https://www.instagram.com/guruvan_foundation" style="color:#E3CE8C;text-decoration:none">@guruvan_foundation</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>`

  await transport.sendMail({
    from: process.env.MAIL_FROM || `"Guruvan Foundation" <${process.env.SMTP_USER}>`,
    to: donation.donor.email,
    subject: `Thank you, ${firstName} — your receipt and certificate (${donation.receiptNo})`,
    text,
    html,
    attachments: [
      ...(hasLogo
        ? [{ filename: 'guruvan-logo.png', path: LOGO, cid: 'guruvanlogo', contentDisposition: 'inline' }]
        : []),
      { filename: `${donation.receiptNo}-receipt.pdf`, content: receiptPdf },
      { filename: `${donation.receiptNo}-certificate.pdf`, content: certificatePdf },
    ],
  })

  await Donation.updateOne({ _id: donation._id }, { receiptEmailedAt: new Date() })
}
