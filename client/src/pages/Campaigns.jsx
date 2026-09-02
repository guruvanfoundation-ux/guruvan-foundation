import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IMG from "../lib/images.js";
import PageHero from "../components/PageHero.jsx";
import CtaBanner from "../components/CtaBanner.jsx";
import { fetchCampaigns } from "../lib/api.js";

const CAMPAIGN_IMAGES = {
  "green-india": IMG.saplingHands,
  "education-for-all": IMG.students,
  "health-for-all": IMG.healthCamp,
  "virasat-vana": "/images/virasatvana.jpeg",
  "shiksha-setu": "/images/shikhshasetu1.jpeg",
};

const FALLBACK = [
  { slug: "virasat-vana", title: "Project Virasat Vana", description: "One Tree. One Life. One Legacy. A mission to plant and nurture 10,000 native trees — restoring green landscapes, protecting biodiversity, and creating a healthier environment for future generations." },
  { slug: "shiksha-setu", title: "ShikshaSetu", description: "Connecting Every Child to a Brighter Future. A complete starter kit for children in need — full school fees for the year, books and stationery, and a uniform with shoes — so poverty never stands between a child and their classroom." },
];

const UPCOMING = [
  { when: "Monsoon", title: "Monsoon Plantation Drive", text: "Village-wide sapling planting timed to the first rains.", image: "/images/monsoondrive.jpeg" },
  { when: "School term", title: "School Kit Distribution", text: "Books, bags and stationery for students who need them.", image: "/images/school-kit-distribution.jpg" },
  { when: "Winter", title: "Community Health Camp", text: "Free check-ups, screening and medicines.", image: "/images/healthcamp.png" },
];

const PAST = [
  { title: "Plantation Drive — Moti Gidasan", result: "60 saplings", text: "Planted in memory of Late Shri Jigarbhai Chaudhary, with local community members and Guruvan volunteers." },
];

const HELP = [
  { title: "Donate", text: "Fund a campaign directly. Every donation gets a receipt.", to: "/donate", cta: "Donate now" },
  { title: "Volunteer", text: "Give your time on the ground at a drive or camp.", to: "/get-involved#join", cta: "Join us" },
  { title: "Partner", text: "Bring your company or institution on board.", to: "/get-involved", cta: "Partner with us" },
  { title: "Spread the word", text: "Share a campaign with your circle and widen its reach.", to: "/contact", cta: "Get in touch" },
];

function CampaignContribution({ campaign }) {
  const [quantity, setQuantity] = useState(1)
  const unit = campaign.contributionAmount
  if (!unit) return <Link to={`/donate?campaign=${encodeURIComponent(campaign.title)}`} className="btn-green mt-4">SUPPORT NOW</Link>
  const total = unit * quantity
  return (
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <div>
        <p className="text-sm font-700 text-forest-800">₹{unit.toLocaleString('en-IN')} {campaign.contributionLabel || 'per contribution'}</p>
        <label className="mt-1 block text-xs text-ink/60">
          Number to sponsor
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="ml-2 w-16 rounded border border-forest-line px-2 py-1 text-sm" />
        </label>
      </div>
      <Link to={`/donate?campaign=${encodeURIComponent(campaign.title)}&amount=${total}`} className="btn-green">
        SUPPORT ₹{total.toLocaleString('en-IN')}
      </Link>
    </div>
  )
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState(FALLBACK);

  useEffect(() => {
    fetchCampaigns().then(setCampaigns).catch(() => {});
  }, []);

  return (
    <>
      <PageHero title="Campaigns" image={IMG.saplingHands} />

      <section className="container-g mt-10">
        <div className="card p-6 sm:p-10">
          <h2 className="section-title">Ongoing Campaigns</h2>
          <p className="mt-2 text-sm text-ink/60">
            Join our ongoing and upcoming campaigns that create real and lasting impact.
          </p>
          <div className="mt-8 space-y-8">
            {campaigns.map((c) => (
              <article key={c.slug} className="grid items-center gap-6 rounded-card bg-cream p-4 sm:grid-cols-[260px_1fr] sm:p-6">
                <img
                  src={CAMPAIGN_IMAGES[c.slug] || IMG.planting}
                  alt={c.title}
                  className="h-44 w-full rounded-card object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-xl font-bold">{c.title}</h3>
                  <p className="mt-2 max-w-xl text-sm text-ink/70">{c.description}</p>
                  {c.goalAmount > 0 && (
                    <div className="mt-3 max-w-sm">
                      <div className="h-2 overflow-hidden rounded-full bg-forest-line">
                        <div
                          className="h-full rounded-full bg-forest"
                          style={{ width: `${Math.min(100, ((c.raisedAmount || 0) / c.goalAmount) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-ink/60">
                        ₹{(c.raisedAmount || 0).toLocaleString("en-IN")} raised of ₹{c.goalAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                  <CampaignContribution campaign={c} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming + Past */}
      <section className="container-g mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-6 sm:p-8" id="upcoming">
          <h2 className="section-title text-2xl">Upcoming Campaigns</h2>
          <p className="mt-2 text-sm text-ink/60">Planned for the coming season.</p>
          <ul className="mt-5 space-y-4">
            {UPCOMING.map((c) => (
              <li key={c.title} className="flex items-start gap-4 rounded-card bg-cream p-4">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-16 w-20 shrink-0 rounded-card object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-sm font-bold">{c.title}</h3>
                  <p className="mt-1 text-sm text-ink/70">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 sm:p-8" id="past">
          <h2 className="section-title text-2xl">Past Campaigns</h2>
          <p className="mt-2 text-sm text-ink/60">What we have completed so far.</p>
          <ul className="mt-5 space-y-4">
            {PAST.map((c) => (
              <li key={c.title} className="rounded-card border border-forest-line p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-bold">{c.title}</h3>
                  <span className="shrink-0 text-xs font-bold text-forest-600">{c.result}</span>
                </div>
                <p className="mt-1 text-sm text-ink/70">{c.text}</p>
              </li>
            ))}
          </ul>
          <p className="hidden">
            Placeholder entries — replace with completed campaigns and verified numbers.
          </p>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="container-g mt-10" id="how-you-can-help">
        <div className="card p-3 sm:p-5">
          <h2 className="section-title">How You Can Help</h2>
          <p className="mt-1 text-sm text-ink/60">
            Support a campaign in whichever way suits you best.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HELP.map((h) => (
              <div key={h.title} className="flex flex-col rounded-card border border-forest-line p-4">
                <h3 className="text-[17px] font-bold text-forest-900 sm:text-[18px]">{h.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/75">{h.text}</p>
                <Link to={h.to} className="mt-auto inline-block pt-3 text-[17px] font-bold text-forest hover:underline">
                  {h.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-g my-2">
        <CtaBanner
          text="Every campaign you support brings us closer to a better tomorrow."
          buttonLabel="DONATE NOW"
          to="/donate"
          tone="orange"
        />
      </section>
    </>
  );
}
