import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Quick links',
    items: [
      ['About us', '/about'],
      ['Our work', '/our-work'],
      ['Campaigns', '/campaigns'],
      ['Get involved', '/get-involved']
    ]
  },
  {
    title: 'Support',
    items: [
      ['Donate', '/donate'],
      ['Volunteer', '/get-involved'],
      ['Partner with us', '/get-involved'],
      ['Resources', '/resources']
    ]
  }
]

import SocialIcons from './SocialIcons.jsx'

export default function Footer() {
  return (
    <footer className="mt-4 border-t-4 border-saffron-500 bg-forest-dark text-white/75">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="lg:pr-6">
          <img src="/images/logo-white.png" alt="Guruvan Foundation" className="h-11 w-auto" />
          <p className="mt-5 text-[15px] leading-relaxed">
            A Section 8 non-profit working for environment conservation, quality education and
            better health — so every community can grow and thrive.
          </p>
          <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
            Educate · Plant · Empower
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
              {col.title}
            </h3>
            <ul className="mt-5 space-y-3 text-[15px]">
              {col.items.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="transition-colors hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

          <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Reach us
          </h3>
          <ul className="mt-5 space-y-3 text-[15px]">
            <li>GROUND FLOOR, LS NO 91,<br />Dalwada, Banaskantha,<br />Gujarat, INDIA - 385515</li>
            <li><a className="hover:text-white" href="mailto:guruvanfoundation@gmail.com">guruvanfoundation@gmail.com</a></li>
            <li><a className="hover:text-white" href="tel:+919023435636">+91 90234 35636</a></li>
          </ul>
          <div className="mt-6">
            <SocialIcons size={9} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-5 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Guruvan Foundation. CIN U85500GJ2026NPL179944.</p>
          <p className="flex gap-5">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/refund-policy" className="hover:text-white">Refund policy</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
