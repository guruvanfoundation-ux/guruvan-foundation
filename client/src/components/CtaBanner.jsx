import { Link } from "react-router-dom";

/** Rounded CTA band. tone="green" (leaf motif) or tone="orange". */
export default function CtaBanner({ text, buttonLabel, to, tone = "green" }) {
  const green = tone === "green";
  return (
    <div className={`relative overflow-hidden rounded-card px-6 py-8 sm:px-10 ${green ? "bg-forest-deep" : "bg-saffron"}`}>
      {green && (
        <svg className="pointer-events-none absolute -right-4 bottom-0 h-28 w-28 text-white/10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C7 7 5 11 5 15a7 7 0 0014 0c0-4-2-8-7-13zm0 5c3 3 4 5.5 4 8a4 4 0 01-8 0c0-2.5 1-5 4-8z" />
        </svg>
      )}
      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-base font-semibold text-white sm:text-lg">{text}</p>
        <Link to={to} className={green ? "btn-orange shrink-0" : "btn bg-white text-saffron-dark hover:bg-cream shrink-0"}>
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
