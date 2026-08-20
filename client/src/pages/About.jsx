import { Link } from "react-router-dom";
import IMG from "../lib/images.js";
import PageHero from "../components/PageHero.jsx";
import StatsBand from "../components/StatsBand.jsx";

const VMV = [
  {
    title: "Our Vision",
    text: "A sustainable, educated and healthy society with nature.",
    // globe ringed by leaves
    icons: [
      "M12 4.8a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4z",
      "M12 4.8c-1.9 2-1.9 8.4 0 10.4M12 4.8c1.9 2 1.9 8.4 0 10.4M6.8 10h10.4",
      "M7.7 6.9C6 6.5 4.5 5 4.1 3.3c1.7.4 3.2 1.9 3.6 3.6z",
      "M16.3 6.9c1.7-.4 3.2-1.9 3.6-3.6-1.7.4-3.2 1.9-3.6 3.6z",
      "M7.7 13.1c-1.7.4-3.2 1.9-3.6 3.6 1.7-.4 3.2-1.9 3.6-3.6z",
      "M16.3 13.1c1.7.4 3.2 1.9 3.6 3.6-1.7-.4-3.2-1.9-3.6-3.6z",
    ],
  },
  {
    title: "Our Mission",
    text: "To create meaningful impact through initiatives.",
    // mortarboard with its tassel
    icons: [
      "M2.5 8.6 12 4.4l9.5 4.2L12 12.8 2.5 8.6z",
      "M6.6 10.4v3.9c0 1.5 2.4 2.6 5.4 2.6s5.4-1.1 5.4-2.6v-3.9",
      "M19.2 9.5v4.1",
      "M19.2 15.8a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z",
    ],
  },
  {
    title: "Our Values",
    text: "Integrity, Compassion, Sustainability, Collaboration.",
    // heart with a tick
    icons: [
      "M12 20.2s-7.3-4.2-7.3-9.1A4 4 0 0 1 12 8.5a4 4 0 0 1 7.3 2.6c0 4.9-7.3 9.1-7.3 9.1z",
      "m8.7 12.5 2.4 2.4 4.5-4.7",
      "M19.7 6.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z",
    ],
  },
];

const FOUNDERS = [
  {
    name: "Bhaumik Makwana",
    role: "Founder & Director",
    bio: "An agriculture graduate committed to a better future for society, Bhaumik believes protecting nature, improving education and promoting good health are the foundations of a strong nation — working at the grassroots to leave a lasting legacy.",
  },
  {
    name: "Ankit Raval",
    role: "Co-Founder & Managing Director",
    bio: "An MSW graduate who founded Guruvan with a vision of a better future through education, environmental conservation and community service. Having faced financial hardship during his own education, he works to ensure everyone has access to learning and growth.",
  },
];

function Icon({ paths }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

export default function About() {
  return (
    <>
      <PageHero title="About Us" image={IMG.saplingHands} />

      <section className="container-g mt-10" id="who-we-are">
        <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Who We Are</h2>
            <p className="mt-4 text-justify text-sm leading-relaxed text-ink/70 hyphens-auto">
              Guruvan Foundation is a non-profit organization working for Environment
              conservation, Education and Health. We believe in building a sustainable
              and equitable society where every individual gets the opportunity to grow
              and thrive.
            </p>
            <p className="mt-3 text-sm font-semibold italic text-forest-700">
              Together, we nurture nature. Together, we create a lasting legacy.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {VMV.map((v) => (
                <div key={v.title} id={v.title.toLowerCase().replace(" ", "-")} className="flex flex-col items-center text-center scroll-mt-28">
                  <span className="icon-chip h-16 w-16"><Icon paths={v.icons} /></span>
                  <h3 className="mt-3 text-sm font-bold">{v.title}</h3>
                  <p className="mt-1 text-xs text-ink/60">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
          <img
            src="/images/whowe.jpg"
            alt="Guruvan Foundation team and community work"
            className="h-72 w-full rounded-card object-cover shadow-card lg:h-full"
            style={{ objectPosition: "center center" }}
          />
        </div>
      </section>

      <section className="container-g mt-10" id="journey">
        <div className="rounded-card bg-forest-deep px-6 py-9 sm:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-2xl font-bold text-white">Our Journey</h2>
              <p className="mt-3 text-sm text-white/80">
                Founded with a passion to serve, we have grown with the support of our
                volunteers, donors and communities who share our dream of a better world.
              </p>
            </div>
            <StatsBand variant="dark" />
          </div>
        </div>
      </section>

      <section className="container-g mt-10" id="team">
        <div className="card p-6 sm:p-10">
          <h2 className="section-title">Our Team</h2>
          <p className="mt-3 text-sm text-ink/70">
            A dedicated team of changemakers working with passion and purpose.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {FOUNDERS.map((f) => {
              const image = f.name === "Bhaumik Makwana" ? "/images/bhaumik.jpg" : "/images/ankit_founder.jpeg";

              return (
                <article key={f.name} className="flex gap-5 rounded-card border border-forest-line p-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-forest-line bg-forest-tint sm:h-22 sm:w-22">
                    <img
                      src={image}
                      alt={f.name}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: f.name === "Bhaumik Makwana" ? "center 25%" : "center 18%",
                        transform: f.name === "Bhaumik Makwana" ? "scale(1.35)" : "scale(1.3)"
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-forest-900">{f.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-forest-600">{f.role}</p>
                    <p className="mt-2 text-justify text-sm leading-relaxed text-ink/70 hyphens-auto">{f.bio}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
