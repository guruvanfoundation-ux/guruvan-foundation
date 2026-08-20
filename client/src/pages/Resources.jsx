import { Link } from "react-router-dom";
import IMG from "../lib/images.js";
import PageHero from "../components/PageHero.jsx";

const ITEMS = [
  { title: "Blog", text: "Read our latest articles and stories.", icon: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" },
  { title: "Reports", text: "Download our reports and publications.", icon: "M6 3h9l4 4v14H6zM14 3v5h5M9 13l2 2 4-4" },
  { title: "Articles", text: "Explore informative articles on impact.", icon: "M6 3h9l4 4v14H6zM9 12h7M9 16h7" },
  { title: "Media Gallery", text: "Photos and videos of our activities.", icon: "M4 7h3l2-2h6l2 2h3v12H4zM12 15a3 3 0 100-6 3 3 0 000 6z" },
  { title: "Downloads", text: "Useful documents and guides.", icon: "M12 4v9m0 0l-3-3m3 3l3-3M5 17h14v3H5z" },
  { title: "News & Updates", text: "Latest news and announcements.", icon: "M5 5h11v14H5zM16 8h3v11h-8M8 9h5M8 12h5M8 15h3" },
];

function Icon({ d }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Resources() {
  return (
    <>
      <PageHero title="Resources" image={IMG.books} />

      <section className="container-g mt-10">
        <div className="card p-6 sm:p-10">
          <h2 className="section-title">Explore &amp; Learn</h2>
          <p className="mt-2 text-sm text-ink/60">
            Knowledge makes change possible. Explore our resources and stay informed.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((r) => (
              <div key={r.title} className="rounded-card border border-forest-line bg-white p-6 text-center transition-shadow hover:shadow-card">
                <span className="mx-auto flex w-fit text-forest"><Icon d={r.icon} /></span>
                <h3 className="mt-3 text-base font-bold">{r.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14 bg-forest-deep">
        <svg className="-mt-8 block w-full text-forest-deep" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" style={{ transform: "translateY(-99%)", position: "absolute" }} />
        <div className="container-g relative flex flex-col items-start gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-white">
            Stay informed. Stay inspired.<br className="hidden sm:block" /> Stay connected with Guruvan Foundation.
          </p>
          <Link to="/get-involved" className="btn-outline">GET INVOLVED</Link>
        </div>
      </section>
    </>
  );
}
