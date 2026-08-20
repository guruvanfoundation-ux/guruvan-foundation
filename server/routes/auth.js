import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const router = Router()

/**
 * Minimal admin login.
 *
 * Credentials live in environment variables so the client can log in immediately
 * without seeding a users collection:
 *   ADMIN_EMAIL, ADMIN_PASSWORD_HASH        -> role "super-admin"
 *   STAFF_EMAIL, STAFF_PASSWORD_HASH        -> role "admin" (optional)
 *
 * Generate a hash with:  node -e "console.log(require('bcryptjs').hashSync('yourpass',10))"
 *
 * This is deliberately simple. When the volunteer/donor portals need their own
 * logins, migrate to a Users collection — this route can keep issuing the same JWTs.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

  const accounts = [
    { email: process.env.ADMIN_EMAIL, hash: process.env.ADMIN_PASSWORD_HASH, role: 'super-admin' },
    { email: process.env.STAFF_EMAIL, hash: process.env.STAFF_PASSWORD_HASH, role: 'admin' },
  ].filter((a) => a.email && a.hash)

  const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase())
  if (!account || !bcrypt.compareSync(password, account.hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server auth is not configured (JWT_SECRET missing).' })
  }

  const token = jwt.sign({ email: account.email, role: account.role }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  })
  res.json({ token, role: account.role, email: account.email })
})

export default router
