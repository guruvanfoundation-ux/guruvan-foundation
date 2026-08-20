import { useReveal } from '../hooks.js'

// Shared green page hero used across inner pages (matches the mockup pattern)
/**
 * Inner-page banner. `image` sets the backdrop photograph — it sits behind the
 * title, tinted and darkened so the white type stays readable.
 */
export function PageHero({ title, image = '/hero-sapling.png' }) {
  return (
    <section className="relative overflow-hidden bg-forest-900">
      <img src={image} alt="" aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-900/70 to-forest-900/30" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
        <h1 className="font-display text-4xl font-800 text-white lg:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-forest-100/80">Home / {title}</p>
      </div>
    </section>
  )
}

export default function PagePlaceholder({ title }) {
  const ref = useReveal()
  return (
    <main>
      <PageHero title={title} />
      <div ref={ref} className="reveal mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-700 text-forest-900">Coming next in the build</h2>
        <p className="mt-3 text-ink/70">This page is scaffolded and routed — its sections will be built to match the approved design.</p>
      </div>
    </main>
  )
}
