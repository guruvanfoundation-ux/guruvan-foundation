import { useState } from "react";
import IMG from "../lib/images.js";
import PageHero from "../components/PageHero.jsx";
import { joinVolunteer } from "../lib/api.js";

const CITY_SUGGESTIONS = [
  "Ahmedabad", "Amritsar", "Bengaluru", "Bhopal", "Chandigarh", "Chennai", "Coimbatore", "Delhi",
  "Gandhinagar", "Hyderabad", "Jaipur", "Jodhpur", "Kanpur", "Kochi", "Kolkata", "Lucknow",
  "Mumbai", "Nagpur", "Nashik", "Pune", "Rajkot", "Surat", "Thane", "Vadodara", "Varanasi",
  "Bhuj", "Bhavnagar", "Junagadh", "Kutch", "Kutchan", "Kutchi", "Kutch Colony", "Kutchapapa",
  "Kuthalur", "Kutchibommaikenkpatty"
];

const WAYS = [
  {
    title: "Volunteer",
    text: "Join our team and contribute your time and skills.",
    // two figures cradling a heart
    icons: [
      "M9 8.7a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2z",
      "M15 8.7a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2z",
      "M5.2 17.6v-3.1c0-2 1.6-3.5 3.5-3.5",
      "M18.8 17.6v-3.1c0-2-1.6-3.5-3.5-3.5",
      "M12 20.4s-3.8-2.4-3.8-5a2 2 0 0 1 3.8-1.2 2 2 0 0 1 3.8 1.2c0 2.6-3.8 5-3.8 5z",
    ],
  },
  {
    title: "Internships",
    text: "Gain experience while creating impact.",
    // briefcase
    icons: [
      "M9.2 6.6V5.4c0-.9.7-1.6 1.6-1.6h2.4c.9 0 1.6.7 1.6 1.6v1.2",
      "M4.6 6.6h14.8c1 0 1.8.8 1.8 1.8v9.4c0 1-.8 1.8-1.8 1.8H4.6c-1 0-1.8-.8-1.8-1.8V8.4c0-1 .8-1.8 1.8-1.8z",
      "M9.4 11.6c.8 1.1 1.6 1.7 2.6 1.7s1.8-.6 2.6-1.7",
    ],
  },
  {
    title: "Partnerships",
    text: "Collaborate with us for greater impact.",
    // two figures joining hands
    icons: [
      "M9 8.7a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2z",
      "M15 8.7a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2z",
      "M4.6 18v-2.6c0-2 1.6-3.6 3.6-3.6 1.2 0 2.3.6 3 1.5",
      "M19.4 18v-2.6c0-2-1.6-3.6-3.6-3.6-1.2 0-2.3.6-3 1.5",
      "m9.5 16.1 1.7 1.7 3.3-3.4",
    ],
  },
  {
    title: "Events",
    text: "Participate in our events and drives.",
    // calendar
    icons: [
      "M4.6 6.4h14.8c1 0 1.8.8 1.8 1.8v9.6c0 1-.8 1.8-1.8 1.8H4.6c-1 0-1.8-.8-1.8-1.8V8.2c0-1 .8-1.8 1.8-1.8z",
      "M2.8 10.4h18.4",
      "M8 4.2v3.6M16 4.2v3.6",
      "M8 14.4a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6z",
      "M12 14.4a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6z",
      "M16 14.4a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6z",
      "M8 17.400000000000002a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6z",
      "M12 17.400000000000002a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6z",
      "M16 17.400000000000002a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6z",
    ],
  },
  {
    title: "Spread the Word",
    text: "Share our mission and inspire others.",
    // megaphone with sound lines
    icons: [
      "M3.8 10.8v2.4c0 1 .8 1.8 1.8 1.8h2.2l6.6 3.9V5.1L7.8 9H5.6c-1 0-1.8.8-1.8 1.8z",
      "M7.8 15v3.3c0 .9.8 1.7 1.7 1.7s1.7-.8 1.7-1.7v-1.5",
      "M17.4 9.6c.9.8 1.4 2 1.4 3.2s-.5 2.4-1.4 3.2",
      "M19.7 7.4c1.4 1.4 2.2 3.3 2.2 5.4s-.8 4-2.2 5.4",
    ],
  },
  {
    title: "Donate",
    text: "Your contribution helps us create more impact.",
    // coin dropping into a collection box
    icons: [
      "M12 3.4a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z",
      "M12 4.8v3.6M11 7.7c.3.3.7.4 1 .4.6 0 1-.3 1-.8s-.4-.7-1-.8-1-.3-1-.8.4-.8 1-.8c.3 0 .7.1 1 .3",
      "M4 12.8h16v6.1c0 1-.8 1.8-1.8 1.8H5.8c-1 0-1.8-.8-1.8-1.8v-6.1z",
      "M4 15.8h16",
      "M10.3 12.8v-.9h3.4v.9",
    ],
  },
];

function Icon({ paths }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

function normalizePhone(value = "") {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

export default function GetInvolved() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", interest: "Volunteer", message: "" });
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  const citySuggestions = CITY_SUGGESTIONS.filter((city) => {
    const q = form.city.trim().toLowerCase();
    if (!q) return true;
    return city.toLowerCase().includes(q);
  }).slice(0, 8);

  const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  const isValidIndianPhone = (value = "") => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return false;
    if (digits.length === 10) return /^[6-9]/.test(digits);
    if (digits.length === 12 && digits.startsWith("91")) return /^[6-9]/.test(digits.slice(2));
    return false;
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validateVolunteerForm = (nextForm) => {
    const name = nextForm.name.trim();
    const email = nextForm.email.trim();
    const phone = String(nextForm.phone || "").trim();
    const city = nextForm.city.trim();

    if (!name) return "Please enter your name.";
    if (!isValidEmail(email)) return "Please enter a valid email address.";
    if (!isValidIndianPhone(phone)) return "Please enter a valid Indian mobile number.";
    if (!city) return "Please enter your city.";
    return "";
  };

  const submit = async () => {
    const validationMsg = validateVolunteerForm(form);
    if (validationMsg) {
      setStatus({ state: "error", msg: validationMsg });
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: normalizePhone(form.phone),
      city: form.city.trim(),
      message: form.message.trim(),
    };

    setStatus({ state: "loading", msg: "" });
    try {
      await joinVolunteer(payload);
      setStatus({ state: "success", msg: "Thank you! Our team will contact you soon." });
      setForm({ name: "", email: "", phone: "", city: "", interest: "Volunteer", message: "" });
    } catch (err) {
      setStatus({ state: "error", msg: err.message || "Could not submit. Try again." });
    }
  };

  return (
    <>
      <PageHero title="Get Involved" image={IMG.volunteers} />

      <section className="container-g mt-10">
        <div className="card p-6 sm:p-10">
          <h2 className="section-title">Many Ways to Get Involved</h2>
          <p className="mt-2 text-sm text-ink/60">Your time, skills and support can create a big difference.</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {WAYS.map((w) => (
              <div key={w.title} className="flex flex-col items-center text-center">
                <span className="icon-chip h-16 w-16"><Icon paths={w.icons} /></span>
                <h3 className="mt-3 text-base font-bold">{w.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join form */}
      <section className="container-g mt-10" id="join">
        <div className="card p-6 sm:p-10">
          <h2 className="section-title">Join Us Today</h2>
          <p className="mt-2 text-sm text-ink/60">Come forward. Be a part of the change.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input className="input" placeholder="Your Name" value={form.name} onChange={set("name")} aria-label="Your name" />
            <input
              className={`input ${form.email && !isValidEmail(form.email) ? "border-red-500" : ""}`}
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={set("email")}
              aria-label="Your email"
            />
            <input
              className={`input ${form.phone && !isValidIndianPhone(form.phone) ? "border-red-500" : ""}`}
              type="tel"
              inputMode="numeric"
              pattern="[0-9+]*"
              placeholder="Phone Number"
              value={form.phone}
              onChange={set("phone")}
              aria-label="Phone number"
            />
            <div className="relative sm:col-span-1">
              <input
                className="input w-full"
                placeholder="City"
                value={form.city}
                onChange={set("city")}
                aria-label="City"
              />
              {form.city.trim() && citySuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-forest/20 bg-white shadow-lg">
                  {citySuggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      className="block w-full border-b border-forest/10 px-3 py-2 text-left text-sm text-ink hover:bg-forest-tint last:border-b-0"
                      onClick={() => setForm({ ...form, city })}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select className="input sm:col-span-2" value={form.interest} onChange={set("interest")} aria-label="How would you like to get involved">
              {["Volunteer", "Internship", "Partnership", "Events", "Other"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <textarea className="input sm:col-span-2" rows="4" placeholder="Tell us about yourself (optional)" value={form.message} onChange={set("message")} aria-label="Message" />
          </div>
          {status.msg && (
            <p className={`mt-3 text-sm font-semibold ${status.state === "success" ? "text-forest" : "text-red-600"}`} role="status">
              {status.msg}
            </p>
          )}
          <button className="btn-orange mt-5" onClick={submit} disabled={status.state === "loading"}>
            {status.state === "loading" ? "SUBMITTING…" : "JOIN US TODAY"}
          </button>
        </div>
      </section>
    </>
  );
}
