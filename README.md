# Guruvan Foundation — Website & Management Platform (MERN)

Public website for Guruvan Foundation (Section 8 non-profit, CIN U85500GJ2026NPL179944),
built to the approved green/white mockup set. React + Vite + Tailwind on the front end,
Express + MongoDB on the back end, Razorpay for donations.

## Run it

```bash
# API
cd server
cp .env.example .env        # fill in Mongo URI + Razorpay test keys
npm install
npm run dev                 # http://localhost:5000

# Website
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

## What's built

**Pages** (all responsive, matching the mockups): Home, About Us, Our Work, Campaigns,
Resources, Get Involved, Donate, Contact — plus routed placeholders for Privacy, Terms
and Refund Policy, which Razorpay requires to be live before account activation.

**Donations.** One Razorpay integration covers every method the client asked for:
UPI (GPay/PhonePe/Paytm), credit and debit cards, netbanking, wallets, and EMI.
International cards can be enabled from the Razorpay dashboard once approved.

Flow: `POST /api/donations/order` creates the order and a pending `Donation` record →
Razorpay Checkout opens → `POST /api/donations/verify` checks the HMAC signature and
marks it paid → a PDF receipt is generated with PDFKit and emailed via Nodemailer.
`POST /api/donations/webhook` is the server-to-server safety net for `payment.captured`
and `payment.failed`, so a donation is never lost if the donor closes the tab.

Receipt numbers are sequential (`GF-2026-000123`). The 80G line reads from
`ORG_80G_NUMBER` in `.env` — leave it as `PENDING_80G_APPROVAL` until the certificate
comes through, then set it and receipts update automatically.

**Also wired:** campaigns API (seeds the three campaigns from the mockup), volunteer
sign-up, contact form.

## Design system

Tokens live in `client/tailwind.config.js`, sampled from the real logo artwork:
deep green `#0E3B21` / `#14532D`, saffron `#E8912B`, cream `#F6F4EC`.
Poppins for display, Inter for body. Shared classes (`.container-g`, `.btn-forest`,
`.btn-orange`, `.card`, `.reveal`) are in `client/src/index.css` — change them there
rather than in individual pages.

Logo files in `client/public/images/` (`logo.png`, `logo-white.png`, `logo-full.png`)
were extracted from the client's own vector artwork as transparent PNGs.

## Before go-live

1. **Razorpay KYC as an NGO** — start this now, it takes 1–2 weeks. Needs the Section 8
   licence, certificate of incorporation, PAN (AANCG1787C) and a bank account in the
   foundation's name. Test mode works without it.
2. **Real photography.** `focus-environment.jpg`, `focus-education.jpg`,
   `focus-health.jpg`, `volunteers-planting.jpg` and `donation-jar.jpg` go in
   `client/public/images/`. The hero photo is already in place.
3. **Confirm the impact numbers.** The mockup's 10,000+ trees / 5,000+ students /
   50+ camps / 100+ volunteers are placeholders — publishing unverified figures on a
   donation page is a real credibility risk for a new foundation.
4. Set `CLIENT_ORIGIN` in the server `.env` to the production domain before deploying.

## Not built yet

Volunteer portal (auto ID cards, appreciation certificates, task assignment),
donor and CSR dashboards, admin panel, crowdfunding, and multi-language
(English/Hindi/Gujarati). These need authentication and role-based access first.

## Admin panel

Log in at **/admin/login**. Starter credentials for local testing (change before launch):

- Email: `admin@guruvanfoundation.org`
- Password: `guruvan@admin`

To set your own password, generate a hash and put it in `server/.env` as `ADMIN_PASSWORD_HASH`:

```bash
cd server
node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD',10))"
```

Also set a real `JWT_SECRET` (any long random string). Generate one with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

The dashboard has two tabs:
- **Photos** — upload/delete images per site section (hero, focus areas, volunteers, media gallery). Files are stored in `server/uploads/` and served from `/uploads/...`. For production, move these to cloud storage (S3/Cloudinary).
- **Volunteers** — approve volunteers (which assigns their ID number) and download their ID card and certificate PDFs.
