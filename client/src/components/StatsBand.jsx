import { useCountUp } from '../hooks.js'
import { LeafTreeIcon, CapIcon, ShieldPlusIcon, HandsHeartIcon } from './Icons.jsx'

/** The foundation's impact figures — the single source for every page that shows them. */
export const STATS = [
  { Icon: LeafTreeIcon,   value: 75, suffix: '', label: 'Trees Planted' },
  { Icon: CapIcon,        value: 0, suffix: '', label: 'Students Educated' },
  { Icon: ShieldPlusIcon, value: 0, suffix: '', label: 'Health Camps' },
  { Icon: HandsHeartIcon, value: 10, suffix: '', label: 'Volunteers' }
]

/* Icon and figure are top-aligned so a label that wraps to two lines in one
   cell can never push that cell's number out of line with its neighbours. */
function Stat({ Icon, value, suffix, label, dark, large }) {
  const [ref, n] = useCountUp(value)
  /* Stacked on a phone, every row gets the same fixed block width so the icons
     and figures line up in a column instead of each row centring on its own. */
  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 ${
        large ? 'mx-auto w-[220px] px-4 py-3 sm:mx-0 sm:w-auto sm:justify-center sm:gap-4' : ''
      }`}
    >
      <Icon
        className={`shrink-0 ${large ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-9 w-9'} ${
          dark ? 'text-gold' : 'text-forest'
        }`}
      />
      <div>
        <p
          className={`font-display font-800 leading-none ${large ? 'text-[26px] sm:text-[30px]' : 'text-[22px]'} ${
            dark ? 'text-gold' : 'text-forest-900'
          }`}
        >
          {n.toLocaleString('en-IN')}{suffix}
        </p>
        <p className={`mt-1.5 ${large ? 'text-[14px]' : 'text-[13px]'} ${dark ? 'text-white/85' : 'text-ink-soft'}`}>
          {label}
        </p>
      </div>
    </div>
  )
}

/**
 * variant  "dark" for the deep-green band (gold figures), "light" on white.
 * large    the full-width home band; omit for the compact version inside a card.
 * dividers hairlines between the columns — only used by the home band.
 */
export default function StatsBand({ variant = 'light', large = false, dividers = false }) {
  const dark = variant === 'dark'
  const columns = large
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-2 gap-x-6 gap-y-8'
  const rules = dividers
    ? `divide-y lg:divide-x lg:divide-y-0 ${dark ? 'divide-white/15' : 'divide-forest-line'}`
    : ''

  return (
    <div className={`grid ${columns} ${rules}`}>
      {STATS.map((s) => (
        <Stat key={s.label} {...s} dark={dark} large={large} />
      ))}
    </div>
  )
}
