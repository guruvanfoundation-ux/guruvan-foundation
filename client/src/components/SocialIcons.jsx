const ICONS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61591753208599',
    icon: (
      <svg viewBox="0 0 24 24" className="block h-full w-full fill-current" aria-hidden="true">
        <path d="M13.5 22v-8h2.8l.4-3.2h-3.2V7.2c0-.9.3-1.6 1.6-1.6H17V2.6c-.5-.1-1.9-.2-3.5-.2-3.6 0-5.8 2-5.8 5.9V11H5.8v3.2h3.9v8h3.8Z" />
      </svg>
    )
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/guruvan_foundation',
    icon: (
      <svg viewBox="0 0 24 24" className="block h-full w-full fill-none stroke-current" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/guruvan-foundation-35919b426/',
    icon: (
      <svg viewBox="0 0 24 24" className="block h-full w-full fill-current" aria-hidden="true">
        <path d="M6.7 8.8a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM5.2 10.3h3.1v9.7H5.2v-9.7Zm5.3 0h3v1.4h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5v5.9h-3.1v-5.5c0-1.3-.1-2.9-1.8-2.9s-2.1 1.4-2.1 2.8v5.6h-3.1v-9.6Z" />
      </svg>
    )
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@GuruvanFoundation',
    icon: (
      <svg viewBox="0 0 24 24" className="block h-full w-full fill-current" aria-hidden="true">
        <path d="M22.7 8.1a3 3 0 0 0-2.1-2.1C18.9 5.5 12 5.5 12 5.5s-6.9 0-8.6.5A3 3 0 0 0 1.3 8.1 31.6 31.6 0 0 0 1 12a31.6 31.6 0 0 0 .3 3.9 3 3 0 0 0 2.1 2.1c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 23 12a31.6 31.6 0 0 0-.3-3.9ZM10 15.3V8.7l6 3.3-6 3.3Z" />
      </svg>
    )
  }
]

// Tailwind needs whole class names, so box sizes are looked up rather than interpolated.
const BOX = { 4: 'h-4 w-4', 5: 'h-5 w-5', 6: 'h-6 w-6', 8: 'h-8 w-8', 9: 'h-9 w-9', 10: 'h-10 w-10' }

export default function SocialIcons({ size = 9, className = '' }) {
  const box = BOX[size] || BOX[9]

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      {ICONS.map(({ name, href, icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={name}
          title={name}
          className={`flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-black transition hover:opacity-80 ${className}`}
        >
          <span className="flex h-[78%] w-[78%] items-center justify-center leading-none">
            {icon}
          </span>
        </a>
      ))}
    </div>
  )
}
