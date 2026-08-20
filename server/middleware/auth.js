import jwt from 'jsonwebtoken'

/**
 * Admin guard.
 *
 * Two supported modes so the client can go live before a full user system exists:
 *  1. Static token — set ADMIN_API_TOKEN in .env and send it as `Authorization: Bearer <token>`.
 *  2. JWT — issued by /api/auth/login (see routes/auth.js), signed with JWT_SECRET,
 *     carrying a `role` claim of "admin" or "super-admin".
 *
 * When AUTH_DISABLED=true (local development only) the guard is skipped so you can
 * click around the admin endpoints without logging in. Never set this in production.
 */
export function requireAdmin(req, res, next) {
  if (process.env.AUTH_DISABLED === 'true') {
    req.user = { role: 'super-admin', dev: true }
    return next()
  }

  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required.' })

  // Mode 1: static admin token
  if (process.env.ADMIN_API_TOKEN && token === process.env.ADMIN_API_TOKEN) {
    req.user = { role: 'super-admin', via: 'static-token' }
    return next()
  }

  // Mode 2: JWT
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (!['admin', 'super-admin'].includes(payload.role))
      return res.status(403).json({ error: 'Admin access required.' })
    req.user = payload
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session.' })
  }
}

export function requireSuperAdmin(req, res, next) {
  requireAdmin(req, res, () => {
    if (req.user?.role !== 'super-admin')
      return res.status(403).json({ error: 'Super-admin access required.' })
    next()
  })
}
