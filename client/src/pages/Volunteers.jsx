import { useEffect, useState } from 'react'
import { fetchVolunteerDirectory } from '../lib/api.js'
import PageHero from '../components/PageHero.jsx'

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVolunteerDirectory().then(setVolunteers).catch(() => setError('Volunteer details are unavailable right now.'))
  }, [])

  return (
    <main>
      <PageHero title="Our Volunteers" image="/images/volunteers-planting.png" />
      <section className="container-g py-14 lg:py-20">
        <h1 className="section-title">Volunteer Directory</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">Meet the approved volunteers who are helping create change in their communities.</p>
        {error && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {!error && volunteers.length === 0 && <p className="mt-6 text-ink-soft">No approved volunteers are listed yet.</p>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {volunteers.map((v) => (
            <article key={v.volunteerId} className="rounded-card border border-forest-line bg-white p-5">
              <h2 className="font-display text-lg font-700 text-forest-900">{v.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{v.city || 'Guruvan Foundation volunteer'}</p>
              <p className="mt-4 text-xs font-700 uppercase tracking-wide text-forest-600">{v.interest}</p>
              <p className="mt-2 text-xs text-ink-soft">Volunteer ID: {v.volunteerId}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
