import { Link } from "react-router-dom";
import IMG from "../lib/images.js";
import PageHero from "../components/PageHero.jsx";
import CtaBanner from "../components/CtaBanner.jsx";
import StatsBand from "../components/StatsBand.jsx";

const STORIES = [
  {
    tag: "Environment",
    title: "A village grove that took root",
    text: "Saplings planted with the local panchayat, watered and tracked by volunteers through the first dry season.",
    img: "/images/whatenv.jpeg",
  },
  {
    tag: "Education",
    title: "Back to the classroom",
    text: "Learning kits and after-school support helped students return to school and stay there.",
    img: "/images/stud1.jpeg",
    crop: "object-[50%_18%]",
  },
  {
    tag: "Health",
    title: "A camp that reached everyone",
    text: "A free check-up camp brought screening and medicines to families who rarely see a doctor.",
    img: IMG.healthCamp,
  },
];

const WORK = [
  { title: "Environment", text: "We organize tree plantation drives, conservation projects and sustainability awareness programs.", img: "/images/whatenv.jpeg", crop: "object-[50%_48%]" },
  { title: "Education", text: "We support quality education, skill development and digital literacy programs.", img: "/images/stud1.jpeg", crop: "object-[50%_18%]" },
  { title: "Health", text: "We conduct health camps, awareness programs and initiatives for community well-being.", img: IMG.healthCamp, crop: "object-center" },
];

export default function OurWork() {
  return (
    <>
      <PageHero title="Our Work" image={IMG.planting} />

      <section className="container-g mt-10">
        <div className="card p-6 sm:p-10">
          <h2 className="section-title">What We Do</h2>
          <p className="mt-2 text-sm text-ink/60">
            We work in key areas to bring positive change in communities and environment.
          </p>
          <div className="mt-8 space-y-8">
            {WORK.map((w) => (
              <article key={w.title} className="grid items-center gap-6 sm:grid-cols-[280px_1fr]">
                <img
                  src={w.img}
                  alt={w.title}
                  className={`h-44 w-full rounded-card object-cover ${w.crop || "object-center"}`}
                  loading="lazy"
                />
                <div>
                  <h3 className="text-xl font-bold">{w.title}</h3>
                  <p className="mt-2 max-w-xl text-sm text-ink/70">{w.text}</p>
                  <Link to="/campaigns" className="mt-3 inline-block text-sm font-bold text-forest hover:underline">
                    LEARN MORE →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="container-g mt-10" id="impact">
        <div className="rounded-card bg-forest-deep px-6 py-9 sm:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-2xl font-bold text-white">Our Impact</h2>
              <p className="mt-3 text-sm text-white/80">
                Every drive, camp and classroom adds up. Here is what our volunteers and
                donors have made possible so far.
              </p>
            </div>
            <StatsBand variant="dark" />
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="container-g mt-10" id="success-stories">
        <div className="card p-6 sm:p-10">
          <h2 className="section-title">Success Stories</h2>
          <p className="mt-2 text-sm text-ink/60">
            Real change, told by the people who lived it.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STORIES.map((s) => (
              <article key={s.title} className="overflow-hidden rounded-card border border-forest-line bg-white">
                <img
                  src={s.img}
                  alt=""
                  className={`h-44 w-full object-cover ${s.crop || "object-center"}`}
                  loading="lazy"
                />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-forest-600">{s.tag}</p>
                  <h3 className="mt-2 text-base font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink/70">{s.text}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="hidden">
            Placeholder stories — replace with real beneficiary stories and photos before launch.
          </p>
        </div>
      </section>

      <section className="container-g mt-10">
        <CtaBanner
          text="Be a part of our work and help us build a better tomorrow for all."
          buttonLabel="GET INVOLVED"
          to="/get-involved"
          tone="green"
        />
      </section>
    </>
  );
}
