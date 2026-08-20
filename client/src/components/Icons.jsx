/* Line icons drawn to match the mockup's thin-stroke style. */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

export function LeafIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 20c0-7 5-13 15-14 1 9-3 15-11 15H4z" />
      <path d="M4 20c3-4 6-6 10-8" />
    </svg>
  )
}
export function BookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v16H5.5A2.5 2.5 0 0 0 3 21.5V5.5z" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v16h5.5A2.5 2.5 0 0 1 21 21.5V5.5z" />
    </svg>
  )
}
export function HeartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.9a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
    </svg>
  )
}
export function TreeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3 6.5 11h3L5 17h14l-4.5-6h3L12 3z" />
      <path d="M12 17v4" />
    </svg>
  )
}
export function CapIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M2 8.5 12 4l10 4.5L12 13 2 8.5z" />
      <path d="M6 10.6V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.4" />
    </svg>
  )
}
export function ShieldPlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3l7 2.6v5.6c0 4.3-3 7.6-7 9.8-4-2.2-7-5.5-7-9.8V5.6L12 3z" />
      <path d="M12 9v5M9.5 11.5h5" />
    </svg>
  )
}
export function PeopleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17 14.4c2 .7 3.5 2.4 3.5 4.6" />
    </svg>
  )
}
/* Cupped hand holding a sprout — the Environment mark on the home pillars. */
export function HandPlantIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 12.2V7" />
      <path d="M12 9.2c0-2.3 1.8-4.2 4.1-4.2 0 2.3-1.8 4.2-4.1 4.2z" />
      <path d="M12 10.6C9.7 10.6 7.9 8.8 7.9 6.5c2.3 0 4.1 1.8 4.1 4.1z" />
      <path d="M3 13.6c1.3 0 2.1.6 3.4 1.6 1.4 1.1 3.2 1.8 5.6 1.8s4.2-.7 5.6-1.8c1.3-1 2.1-1.6 3.4-1.6" />
      <path d="M3 13.6v1.1c0 3.1 4 5.6 9 5.6s9-2.5 9-5.6v-1.1" />
    </svg>
  )
}
/* Heart with a pulse line — the Health mark. */
export function HeartPulseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 20.5S4.2 16.1 4.2 10.7A4.1 4.1 0 0 1 12 8.7a4.1 4.1 0 0 1 7.8 2c0 5.4-7.8 9.8-7.8 9.8z" />
      <path d="M4.8 12.4h3l1.4-2.6 2.1 4.7 1.6-2.9 1 .8h4.3" />
    </svg>
  )
}
/* Open hand cradling a heart — the Volunteers figure on the impact band. */
export function HandsHeartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 12.4C9.6 10.7 8 9.3 8 7.6 8 6.2 9.1 5.2 10.4 5.2c.8 0 1.3.4 1.6.9.3-.5.8-.9 1.6-.9 1.3 0 2.4 1 2.4 2.4 0 1.7-1.6 3.1-4 4.8z" />
      <path d="M3 14.6c1.3 0 2.1.6 3.4 1.6 1.4 1.1 3.2 1.8 5.6 1.8s4.2-.7 5.6-1.8c1.3-1 2.1-1.6 3.4-1.6" />
      <path d="M3 14.6v.9c0 3.1 4 5.6 9 5.6s9-2.5 9-5.6v-.9" />
    </svg>
  )
}
/* Broad-canopy tree — the Trees Planted figure on the impact band. */
export function LeafTreeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 21.5v-9" />
      <path d="M12 2.8c3.7 0 6.7 2.9 6.7 6.5S15.7 15.8 12 15.8 5.3 12.9 5.3 9.3 8.3 2.8 12 2.8z" />
      <path d="m12 16.6-3-2.6M12 14.4l2.9-2.5" />
    </svg>
  )
}
export function ShieldCheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3l7 2.6v5.6c0 4.3-3 7.6-7 9.8-4-2.2-7-5.5-7-9.8V5.6L12 3z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </svg>
  )
}
export function ReceiptIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21V3z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  )
}
export function ArrowRight(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}
