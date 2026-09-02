import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import SocialIcons from './SocialIcons.jsx'

const links = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Work', to: '/our-work' },
  { label: 'Campaigns', to: '/campaigns' },
  { label: 'Resources', to: '/resources' },
  { label: 'Get Involved', to: '/get-involved' },
  { label: 'Contact Us', to: '/contact' }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Top info bar — tagline left, contact + socials right */}
      <div className="bg-forest-900 text-white">
        {/* Phones show only the email and the social icons, on one slim line;
            the tagline and phone number come back from lg up. */}
        <div className="shell flex h-10 items-center justify-center text-[11px] lg:h-12 lg:justify-between lg:text-[13px]">
          <p className="hidden lg:block">Together for a Greener, Healthier &amp; Educated Tomorrow</p>
          <div className="flex items-center gap-4 lg:gap-8">
            <a href="mailto:guruvanfoundation@gmail.com" className="hover:text-saffron">guruvanfoundation@gmail.com</a>
            <a href="tel:+919023435636" className="hidden hover:text-saffron lg:inline">+91 90234 35636</a>
            <span className="lg:hidden"><SocialIcons size={5} /></span>
            <span className="hidden lg:block"><SocialIcons size={6} /></span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="shell flex h-[76px] items-center justify-between gap-4 lg:h-[92px]">
          {/* The original logo artwork carries the name, so only the strapline is set in type */}
          <Link to="/" className="flex shrink-0 flex-col items-center gap-1" aria-label="Guruvan Foundation — home">
            <img src="/images/logo-full.png" alt="Guruvan Foundation" className="h-10 w-auto sm:h-12 lg:h-[62px]" />
            <span className="hidden">
              <span className="text-[#15509a]">Educate</span> <span className="text-black">|</span>{' '}
              <span className="text-[#3c6b23]">Plant</span> <span className="text-black">|</span>{' '}
              <span className="text-[#c77a25]">Empower</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 nav:flex" aria-label="Primary">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `whitespace-nowrap font-display text-[12.5px] font-600 uppercase tracking-[0.03em] transition-colors hover:text-forest ${
                    isActive ? 'text-forest-600' : 'text-ink-soft'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/donate" className="btn-forest hidden !px-6 !py-3 sm:inline-flex">
              Donate us
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid h-11 w-11 place-items-center rounded-md text-forest nav:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          id="mobile-menu"
          className={`overflow-hidden border-t border-black/5 bg-white transition-[max-height] duration-300 nav:hidden ${
            open ? 'max-h-[540px]' : 'max-h-0'
          }`}
        >
          <nav className="shell flex flex-col py-2" aria-label="Mobile">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `border-b border-black/5 py-3.5 font-display text-[13px] font-600 uppercase tracking-[0.03em] ${
                    isActive ? 'text-forest-600' : 'text-ink'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/donate" className="btn-forest my-4 w-full">Donate us</Link>
          </nav>
        </div>
      </header>
    </>
  )
}
