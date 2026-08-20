import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../lib/adminAuth.js'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-forest-wash px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-card bg-white shadow-card">
          <div className="border-b border-forest-line bg-white px-8 pb-6 pt-8 text-center">
            <img src="/images/logo.png" alt="Guruvan Foundation" className="mx-auto h-11 w-auto" />
            <p className="mt-4 font-display text-[11px] font-700 uppercase tracking-[0.18em] text-forest-600">
              Admin area
            </p>
            <h1 className="mt-2 font-display text-2xl font-800 text-forest-900">Sign in</h1>
            <p className="mt-1 text-sm text-ink-soft">Manage photos and volunteers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-8 py-7">
            <div>
              <label className="text-[13px] font-600 text-forest-900" htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="username" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1.5" placeholder="admin@guruvanfoundation.org" />
            </div>
            <div>
              <label className="text-[13px] font-600 text-forest-900" htmlFor="password">Password</label>
              <input id="password" type="password" required autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1.5" placeholder="••••••••" />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-100" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="btn-forest w-full disabled:opacity-60">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link to="/" className="transition hover:text-forest">← Back to the website</Link>
        </p>
      </div>
    </main>
  )
}
