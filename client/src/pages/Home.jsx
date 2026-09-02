import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../hooks.js'
import StatsBand from '../components/StatsBand.jsx'
import { HandPlantIcon, CapIcon, HeartPulseIcon, ArrowRight } from '../components/Icons.jsx'
import { apiUrl, fetchMedia } from '../lib/api.js'

const HERO_PHOTO = '/images/hero-sapling.png'
const HERO_VIDEO = '/videos/homepagevid.mp4'

const pillars = [
  { Icon: HandPlantIcon, title: 'Environment', text: 'Planting trees, conserving nature and promoting sustainability.' },
  { Icon: CapIcon,       title: 'Education',   text: 'Empowering children and youth through quality education.' },
  { Icon: HeartPulseIcon, title: 'Health',     text: 'Improving healthcare access and promoting healthy communities.' }
]

const focusAreas = [
  { title: 'Environment', text: 'Afforestation, conservation, clean energy and awareness programs.', img: '/images/whatwedo_environment.jpg', crop: 'object-center' },
  { title: 'Education',   text: 'Skill development, digital literacy and quality education for all.', img: '/images/education.jpg', crop: 'object-center' },
  { title: 'Health',      text: 'Health camps, awareness programs and community well-being.',        img: '/images/health.jpg', crop: 'object-center' }
]

/* Photos the client has yet to supply fall back to the hero shot rather than
   leaving a broken image on the page. Drop the real file in and it takes over. */
function Photo({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        if (e.currentTarget.getAttribute('src') === HERO_PHOTO) return
        e.currentTarget.src = HERO_PHOTO
      }}
    />
  )
}

function Section({ children, className = '' }) {
  const ref = useReveal()
  return <section ref={ref} className={`reveal ${className}`}>{children}</section>
}

/**
 * Hero backdrop: keep the photo centered and unobstructed while the left side is
 * softly washed to keep the text readable.
 */
const HERO_WASH =
  'linear-gradient(to right,' +
  ' #F6F4EC 0%, #F6F4EC 26%,' +
  ' rgba(246,244,236,0.90) 42%,' +
  ' rgba(246,244,236,0.48) 58%,' +
  ' rgba(246,244,236,0) 72%)'

/* Keep the full subject visible rather than cropping it off the right edge. */
/* Down the page rather than across, since the copy stacks on top of the clip.
   Cream stays solid behind the heading, then lifts off entirely. */
// Mobile overlay: slightly higher opacity for better text contrast
const HERO_WASH_MOBILE =
  'linear-gradient(to bottom,' +
  ' rgba(246,244,236,0.32) 0%, rgba(246,244,236,0.30) 34%,' +
  ' rgba(246,244,236,0.22) 55%,' +
  ' rgba(246,244,236,0.12) 74%,' +
  ' rgba(246,244,236,0) 92%)'

// Slightly shift the hero media to the right so the subject is more centered
// Default frame used when JS hasn't run yet (safe for SSR)
const HERO_FRAME = { transform: 'scale(1.08) translateX(0%)' }

const TOGETHER_PHOTO = '/images/women-planting-tree.png'

/* Same idea as the hero: cream holds the left where the copy sits, and the
   photograph is left completely clear from about two thirds across. */
const TOGETHER_WASH =
  'linear-gradient(to right,' +
  ' #F6F4EC 0%, #F6F4EC 22%,' +
  ' rgba(246,244,236,0.92) 38%,' +
  ' rgba(246,244,236,0.55) 52%,' +
  ' rgba(246,244,236,0) 68%)'

function HeroVideo({ frame = HERO_FRAME }) {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) ref.current?.pause()
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[75%]">
        <video
          ref={ref}
          className="h-full w-full object-cover object-center"
          style={frame}
          src={HERO_VIDEO}
          poster={HERO_PHOTO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
      {/* Phones: cream only where the copy sits, clearing below so the clip shows */}
      <div className="absolute inset-0 lg:hidden" style={{ background: HERO_WASH_MOBILE }} />
      <div className="absolute inset-0 hidden lg:block" style={{ background: HERO_WASH }} />
    </div>
  )
}

export default function Home() {
  const [heroFrame, setHeroFrame] = useState(HERO_FRAME)
  const [recentMedia, setRecentMedia] = useState([])

  useEffect(() => {
    fetchMedia().then((items) => setRecentMedia(items.slice(0, 6))).catch(() => setRecentMedia([]))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setHeroFrame({ transform: mq.matches ? 'scale(1.08) translateX(6%)' : 'scale(1.08) translateX(0%)' })
    update()
    try {
      mq.addEventListener('change', update)
    } catch (e) {
      mq.addListener(update)
    }
    return () => {
      try {
        mq.removeEventListener('change', update)
      } catch (e) {
        mq.removeListener(update)
      }
    }
  }, [])

  return (
    <main>
      {/* Cream stage: hero, pillar cards and the "Together" band share one background */}
      <div className="bg-cream">
        {/* HERO — copy over a full-bleed video backdrop */}
        <section className="relative overflow-hidden">
          <HeroVideo frame={heroFrame} />
          <div className="shell relative z-10">
            <div className="py-16 sm:py-20 lg:w-[62%] lg:pb-32 lg:pt-24">
              <h1 className="font-display text-[32px] font-800 leading-[1.14] sm:text-[40px] lg:text-[38px] xl:text-[46px]">
                <span className="block text-forest-500 lg:text-ink">Building a Better Tomorrow</span>
                <span className="block text-forest-500 lg:text-ink">for People &amp; Planet</span>
              </h1>
              <p className="mt-6 max-w-[500px] text-[16px] leading-relaxed text-forest-500 lg:text-ink-soft sm:text-[17px]">
                We work for Environment conservation, Quality Education and Better Health for all.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/get-involved" className="btn-forest">Get involved</Link>
                <Link to="/donate" className="btn-outline">Donate now</Link>
              </div>
            </div>
          </div>

        </section>

        {/* PILLAR CARDS — overlapping the hero */}
        <Section className="shell relative z-20 -mt-8 lg:-mt-14">
          <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
            {pillars.map(({ Icon, title, text }) => (
              <div key={title} className="flex items-start gap-5 rounded-md bg-white p-6 shadow-card lg:p-7">
                <Icon className="h-11 w-11 shrink-0 text-forest lg:h-12 lg:w-12" />
                <div>
                  <h3 className="font-display text-[17px] font-700 text-forest-900">{title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* TOGETHER BAND — copy left, photograph right, sitting close above the impact band */}
        <Section className="relative overflow-hidden">
            <div className="absolute inset-0">
            <img
              src={TOGETHER_PHOTO}
              alt="A woman planting a sapling at a community plantation drive"
              loading="lazy"
              className="h-full w-full object-cover object-[50%_55%]"
              style={heroFrame}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/85 to-cream/30 lg:hidden" />
            <div className="absolute inset-0 hidden lg:block" style={{ background: TOGETHER_WASH }} />
          </div>

          <div className="shell relative py-16 lg:py-24">
            <div className="lg:w-[46%]">
              {/* capped so the line breaks after "Create", as in the reference */}
              <h2 className="font-display text-[26px] font-700 leading-tight text-forest-900 lg:max-w-[400px] lg:text-[30px]">
                Together, We Can Create Lasting Change
              </h2>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
                Join hands with us to build a sustainable, educated and healthy society. Every step counts!
              </p>
              <Link to="/about" className="btn-forest mt-8">Learn more</Link>
            </div>
          </div>
        </Section>
      </div>

      {/* IMPACT BAND — full-bleed deep green */}
      <section className="bg-forest-900">
        <div className="shell py-8 lg:py-10">
          <StatsBand variant="dark" large dividers />
        </div>
      </section>

      {/* FOCUS AREAS */}
      <Section className="shell pb-12 pt-16 lg:pb-14 lg:pt-20">
        <h2 className="section-title text-center">Our Focus Areas</h2>
        <p className="mt-3 text-center text-[15px] text-ink-soft">
          We work in core areas that bring sustainable and measurable impact.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {focusAreas.map((f) => (
            <article key={f.title} className="group">
              <div className="overflow-hidden rounded-lg">
                <Photo
                  src={f.img}
                  alt={f.title}
                  className={`h-56 w-full object-cover transition duration-500 group-hover:scale-105 ${f.crop || 'object-center'}`}
                />
              </div>
              <h3 className="mt-5 font-display text-[19px] font-700 text-forest-900">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{f.text}</p>
              <Link to="/our-work" className="mt-3 inline-flex items-center gap-2 font-display text-[12.5px] font-700 uppercase tracking-[0.08em] text-forest-600 hover:text-forest-900">
                Read more <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* DONATE CTA — the footer's own top margin supplies the gap below it */}
      {recentMedia.length > 0 && (
        <Section className="shell pb-12 lg:pb-16">
          <h2 className="section-title text-center">Latest From Our Community</h2>
          <p className="mt-3 text-center text-[15px] text-ink-soft">Recently uploaded photos and media from Guruvan Foundation activities.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {recentMedia.map((media) => (
              <figure key={media._id} className="overflow-hidden rounded-lg bg-cream">
                <img src={apiUrl(media.url)} alt={media.caption || 'Guruvan Foundation activity'} loading="lazy" className="h-36 w-full object-cover transition duration-300 hover:scale-105" />
                {media.caption && <figcaption className="truncate px-3 py-2 text-xs text-ink-soft">{media.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </Section>
      )}

      <Section className="shell">
        <div className="relative overflow-hidden rounded-card bg-forest-900 px-8 py-12 lg:px-12">
          <img
            src="/images/shikhshasetu.jpeg"
            alt="Education and community development"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-forest-900/60" />
          <svg className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-leaf-500/25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C7 7 4 11 4 15a8 8 0 0016 0c0-4-3-8-8-13z" />
          </svg>
          <div className="relative z-10">
            <h2 className="font-display text-[28px] font-800 text-white lg:text-3xl">Be the Change. Make an Impact.</h2>
            <p className="mt-3 text-[15px] text-white/80">Your support today can create a better tomorrow.</p>
            <Link to="/donate" className="btn-orange mt-7">Donate now</Link>
          </div>
        </div>
      </Section>
    </main>
  )
}
