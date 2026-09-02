import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminFetch, adminDownload, logout, isLoggedIn, getRole } from '../lib/adminAuth.js'

const SLOTS = [
  { id: 'hero', label: 'Homepage hero' },
  { id: 'volunteers', label: 'Volunteers section' },
  { id: 'focus-environment', label: 'Focus — Environment' },
  { id: 'focus-education', label: 'Focus — Education' },
  { id: 'focus-health', label: 'Focus — Health' },
  { id: 'gallery', label: 'Media gallery' },
]

/* Uploads are served by the API, which may sit on a different origin than the site */
const mediaUrl = (url) => `${import.meta.env.VITE_API_URL || ''}${url}`

/* Local line icons, drawn to match the public site's stroke style */
const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ImageIcon = (p) => (
  <svg viewBox="0 0 24 24" {...ico} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10" r="1.5" />
    <path d="m4 17 4.5-4.5 3 3L15 12l5 5" />
  </svg>
)
const UsersIcon = (p) => (
  <svg viewBox="0 0 24 24" {...ico} {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 6.2a3 3 0 0 1 0 5.6M17 14.4c2 .7 3.5 2.4 3.5 4.6" />
  </svg>
)
const UploadIcon = (p) => (
  <svg viewBox="0 0 24 24" {...ico} {...p}>
    <path d="M12 16V4M8 8l4-4 4 4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
)
const TrashIcon = (p) => (
  <svg viewBox="0 0 24 24" {...ico} {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </svg>
)
const FileIcon = (p) => (
  <svg viewBox="0 0 24 24" {...ico} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5" />
  </svg>
)

function Alert({ kind = 'info', children }) {
  if (!children) return null
  const tone = {
    success: 'bg-forest-tint text-forest-800 ring-forest-100',
    error: 'bg-red-50 text-red-700 ring-red-100',
    info: 'bg-forest-wash text-ink-soft ring-forest-line',
  }[kind]
  return <p className={`mt-4 rounded-lg px-4 py-2.5 text-sm ring-1 ${tone}`} role="status">{children}</p>
}

function Panel({ title, hint, children, aside }) {
  return (
    <section className="rounded-card bg-white p-6 shadow-card sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-700 text-forest-900">{title}</h2>
          {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

function PhotoManager() {
  const [slot, setSlot] = useState('gallery')
  const [items, setItems] = useState([])
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  async function load() {
    try { setItems(await adminFetch(`/api/media?slot=${slot}`)) }
    catch (e) { setMsg({ kind: 'error', text: e.message }) }
  }
  useEffect(() => { load() }, [slot]) // eslint-disable-line

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return setMsg({ kind: 'error', text: 'Choose an image first.' })
    setBusy(true); setMsg(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('slot', slot)
      fd.append('caption', caption)
      await adminFetch('/api/media', { method: 'POST', body: fd })
      setFile(null); setCaption('')
      setMsg({ kind: 'success', text: 'Photo uploaded.' })
      load()
    } catch (err) {
      setMsg({ kind: 'error', text: err.message })
    } finally { setBusy(false) }
  }

  async function remove(id) {
    if (!confirm('Delete this image? This cannot be undone.')) return
    try { await adminFetch(`/api/media/${id}`, { method: 'DELETE' }); load() }
    catch (e) { setMsg({ kind: 'error', text: e.message }) }
  }

  const current = SLOTS.find((s) => s.id === slot)

  return (
    <div className="space-y-6">
      <Panel title="Website photos" hint="Pick a section, then upload the images that should appear there.">
        <div className="mt-5 flex flex-wrap gap-2">
          {SLOTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSlot(s.id)}
              className={`rounded-full px-4 py-2 text-[13px] font-600 transition ${
                slot === s.id
                  ? 'bg-forest-900 text-white'
                  : 'bg-forest-wash text-ink-soft ring-1 ring-forest-line hover:text-forest'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleUpload} className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragging(false)
              const dropped = e.dataTransfer.files?.[0]
              if (dropped?.type.startsWith('image/')) setFile(dropped)
            }}
            className={`flex cursor-pointer items-center gap-4 rounded-card border-2 border-dashed p-5 transition ${
              dragging ? 'border-forest-600 bg-forest-tint' : 'border-forest-line bg-forest-wash hover:border-forest-600'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            {preview ? (
              <img src={preview} alt="" className="h-16 w-20 shrink-0 rounded-md object-cover ring-1 ring-forest-line" />
            ) : (
              <span className="grid h-16 w-20 shrink-0 place-items-center rounded-md bg-white text-forest-600 ring-1 ring-forest-line">
                <UploadIcon className="h-6 w-6" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-600 text-forest-900">
                {file ? file.name : 'Drop an image here, or click to browse'}
              </span>
              <span className="mt-0.5 block text-xs text-ink-soft">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB — will be added to ${current.label}`
                  : 'JPG or PNG. Landscape photos work best.'}
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input"
            />
            <button type="submit" disabled={busy || !file} className="btn-forest w-full disabled:opacity-50">
              {busy ? 'Uploading…' : 'Upload photo'}
            </button>
          </div>
        </form>

        <Alert kind={msg?.kind}>{msg?.text}</Alert>
      </Panel>

      <Panel
        title={current.label}
        hint={`${items.length} ${items.length === 1 ? 'photo' : 'photos'} in this section`}
      >
        {items.length === 0 ? (
          <div className="mt-5 grid place-items-center rounded-card border border-dashed border-forest-line bg-forest-wash px-6 py-12 text-center">
            <ImageIcon className="h-8 w-8 text-forest-600/60" />
            <p className="mt-3 text-sm font-600 text-forest-900">No photos here yet</p>
            <p className="mt-1 text-sm text-ink-soft">Upload one above and it will show up in this list.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((m) => (
              <figure key={m._id} className="group overflow-hidden rounded-card bg-white ring-1 ring-forest-line">
                <div className="relative">
                  <img src={mediaUrl(m.url)} alt={m.caption || ''} className="h-36 w-full object-cover" />
                  <button
                    onClick={() => remove(m._id)}
                    aria-label="Delete photo"
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100 hover:bg-red-600 hover:text-white"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <figcaption className="truncate px-3 py-2.5 text-xs text-ink-soft">
                  {m.caption || m.originalName}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

function StatChip({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-forest-wash text-forest-900 ring-forest-line',
    good: 'bg-forest-tint text-forest-800 ring-forest-100',
    warn: 'bg-amber-50 text-amber-800 ring-amber-100',
  }
  return (
    <div className={`rounded-card px-4 py-3 ring-1 ${tones[tone]}`}>
      <p className="font-display text-xl font-800 leading-none">{value}</p>
      <p className="mt-1 text-xs font-600 uppercase tracking-wide opacity-75">{label}</p>
    </div>
  )
}

function VolunteerManager() {
  const [vols, setVols] = useState([])
  const [msg, setMsg] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    try { setVols(await adminFetch('/api/volunteers')) }
    catch (e) { setMsg({ kind: 'error', text: e.message }) }
  }
  useEffect(() => { load() }, []) // eslint-disable-line

  async function approve(id) {
    setBusyId(id); setMsg(null)
    try { await adminFetch(`/api/volunteers/${id}/approve`, { method: 'POST' }); load() }
    catch (e) { setMsg({ kind: 'error', text: e.message }) }
    finally { setBusyId(null) }
  }

  async function download(v, kind) {
    setMsg(null)
    try {
      await adminDownload(
        `/api/volunteers/${v._id}/${kind}`,
        `${v.volunteerId}-${kind === 'id-card' ? 'id-card' : 'certificate'}.pdf`
      )
    } catch (e) { setMsg({ kind: 'error', text: e.message }) }
  }

  const approved = vols.filter((v) => v.status === 'approved').length

  return (
    <Panel
      title="Volunteers"
      hint="Approve a sign-up to assign their volunteer ID and unlock their documents."
      aside={
        <div className="flex gap-3">
          <StatChip label="Total" value={vols.length} />
          <StatChip label="Approved" value={approved} tone="good" />
          <StatChip label="Pending" value={vols.length - approved} tone={vols.length - approved ? 'warn' : 'default'} />
        </div>
      }
    >
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      {vols.length === 0 ? (
        <div className="mt-5 grid place-items-center rounded-card border border-dashed border-forest-line bg-forest-wash px-6 py-12 text-center">
          <UsersIcon className="h-8 w-8 text-forest-600/60" />
          <p className="mt-3 text-sm font-600 text-forest-900">No sign-ups yet</p>
          <p className="mt-1 text-sm text-ink-soft">Submissions from the Get Involved form appear here.</p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-card ring-1 ring-forest-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-forest-wash text-[11px] uppercase tracking-wide text-forest-800">
              <tr>
                <th className="px-4 py-3 font-700">Name</th>
                <th className="px-4 py-3 font-700">Contact</th>
                <th className="px-4 py-3 font-700">Interest</th>
                <th className="px-4 py-3 font-700">Status</th>
                <th className="px-4 py-3 text-right font-700">Documents</th>
              </tr>
            </thead>
            <tbody>
              {vols.map((v) => (
                <tr key={v._id} className="border-t border-forest-line align-middle hover:bg-forest-wash/60">
                  <td className="px-4 py-3">
                    <span className="block font-600 text-forest-900">{v.name}</span>
                    <span className="text-xs text-ink-soft">{v.volunteerId || 'ID not assigned'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{v.email}</span>
                    <span className="text-xs text-ink-soft">{v.phone}</span>
                  </td>
                  <td className="px-4 py-3 capitalize">{v.interest || '—'}</td>
                  <td className="px-4 py-3">
                    {v.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-tint px-3 py-1 text-xs font-700 text-forest-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-forest-600" />Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => approve(v._id)}
                        disabled={busyId === v._id}
                        className="rounded-full bg-forest-900 px-4 py-1.5 text-xs font-700 text-white transition hover:bg-forest-700 disabled:opacity-50"
                      >
                        {busyId === v._id ? 'Approving…' : 'Approve'}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {v.status === 'approved' ? (
                      <div className="flex justify-end gap-2">
                        {[['id-card', 'ID card'], ['certificate', 'Certificate']].map(([kind, label]) => (
                          <button
                            key={kind}
                            onClick={() => download(v, kind)}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-700 text-forest-700 ring-1 ring-forest-line transition hover:bg-forest-wash"
                          >
                            <FileIcon className="h-3.5 w-3.5" />{label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="block text-right text-ink-soft/60">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

function ContactManager() {
  const [contacts, setContacts] = useState([])
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    adminFetch('/api/contact').then(setContacts).catch((e) => setMsg({ kind: 'error', text: e.message }))
  }, [])

  return (
    <Panel title="Contact enquiries" hint="Messages submitted through the Contact Us form.">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>
      {contacts.length === 0 ? (
        <div className="mt-5 rounded-card border border-dashed border-forest-line bg-forest-wash px-6 py-12 text-center text-sm text-ink-soft">
          No contact enquiries yet.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-card ring-1 ring-forest-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-forest-wash text-[11px] uppercase tracking-wide text-forest-800">
              <tr><th className="px-4 py-3">From</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Message</th><th className="px-4 py-3">Received</th></tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id} className="border-t border-forest-line align-top">
                  <td className="px-4 py-3"><span className="block font-600 text-forest-900">{c.name}</span><a className="text-xs text-forest-600 hover:underline" href={`mailto:${c.email}`}>{c.email}</a></td>
                  <td className="px-4 py-3">{c.subject || '—'}</td>
                  <td className="min-w-[240px] whitespace-pre-wrap px-4 py-3 text-ink-soft">{c.message}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-soft">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

export default function AdminDashboard() {
  // Tab lives in the hash so a refresh (or a bookmark) keeps you where you were
  const [tab, setTab] = useState(() =>
    window.location.hash === '#volunteers' ? 'volunteers' : 'photos'
  )
  const navigate = useNavigate()

  useEffect(() => { if (!isLoggedIn()) navigate('/admin/login') }, []) // eslint-disable-line

  function selectTab(id) {
    setTab(id)
    window.history.replaceState(null, '', `#${id}`)
  }

  const tabs = [
    ['photos', 'Photos', ImageIcon],
    ['volunteers', 'Volunteers', UsersIcon],
    ['contacts', 'Enquiries', FileIcon],
  ]

  return (
    <div className="min-h-screen bg-forest-wash">
      <header className="sticky top-0 z-40 border-b border-forest-line bg-white">
        <div className="container-g flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Guruvan Foundation" className="h-8 w-auto" />
            <span className="hidden h-6 w-px bg-forest-line sm:block" />
            <span className="hidden font-display text-[11px] font-700 uppercase tracking-[0.18em] text-forest-600 sm:block">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-forest-tint px-3 py-1 text-[11px] font-700 uppercase tracking-wide text-forest-700 sm:inline">
              {getRole() || 'admin'}
            </span>
            <Link to="/" className="hidden text-sm text-ink-soft transition hover:text-forest sm:inline">
              View site
            </Link>
            <button
              onClick={() => { logout(); navigate('/admin/login') }}
              className="rounded-md px-4 py-2 text-[12px] font-700 uppercase tracking-wide text-forest-900 ring-1 ring-forest-line transition hover:bg-forest-wash"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="container-g py-8 lg:py-10">
        <h1 className="font-display text-2xl font-800 text-forest-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage the photos on the website and the volunteers who sign up.</p>

        <nav className="mt-6 inline-flex rounded-full bg-white p-1 shadow-card" aria-label="Sections">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => selectTab(id)}
              aria-current={tab === id}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-700 transition ${
                tab === id ? 'bg-forest-900 text-white' : 'text-ink-soft hover:text-forest'
              }`}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === 'photos' ? <PhotoManager /> : tab === 'volunteers' ? <VolunteerManager /> : <ContactManager />}
        </div>
      </main>
    </div>
  )
}
