import { useState } from "react";
import IMG from "../lib/images.js";
import PageHero from "../components/PageHero.jsx";
import SocialIcons from "../components/SocialIcons.jsx";
import { sendContact } from "../lib/api.js";

// Keep only the newer phone; restore the contact email.
const INFO = [
  { label: "guruvanfoundation@gmail.com", href: "mailto:guruvanfoundation@gmail.com", icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
  { label: "www.guruvanfoundation.org", href: "#", icon: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3.5 3 14.5 0 18-3-3.5-3-14.5 0-18z" },
  { label: "GROUND FLOOR, LS NO 91, Dalwada, Banaskantha, Gujarat, INDIA - 385515", href: "#", icon: "M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
  { label: "+91 90234 35636", href: "tel:+919023435636", icon: "M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" },
];

function Icon({ d }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus({ state: "error", msg: "Please fill your name, email and message." });
      return;
    }
    setStatus({ state: "loading", msg: "" });
    try {
      await sendContact(form);
      setStatus({ state: "success", msg: "Message sent. We will get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ state: "error", msg: err.message || "Could not send message." });
    }
  };

  return (
    <>
      <PageHero title="Contact Us" image="/images/contact-us.jpg" clear />

      <section className="container-g mt-10">
        <div className="card grid gap-10 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="section-title" id="contact-information">Get In Touch</h2>
            <p className="mt-2 text-sm text-ink/60">We'd love to hear from you.</p>
            <ul className="mt-6 space-y-4">
              {INFO.map((i) => (
                <li key={i.label}>
                  <a href={i.href} className="flex items-center gap-3 text-sm font-medium text-ink/80 hover:text-forest">
                    <span className="text-forest"><Icon d={i.icon} /></span>
                    {i.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm font-bold">Follow Us</p>
            <div className="mt-2">
              <SocialIcons size={9} />
            </div>
          </div>

          <div className="grid gap-4">
            <input className="input" placeholder="Your Name" value={form.name} onChange={set("name")} aria-label="Your name" />
            <input className="input" type="email" placeholder="Your Email" value={form.email} onChange={set("email")} aria-label="Your email" />
            <input className="input" placeholder="Subject" value={form.subject} onChange={set("subject")} aria-label="Subject" />
            <textarea className="input" rows="5" placeholder="Your Message" value={form.message} onChange={set("message")} aria-label="Your message" />
            {status.msg && (
              <p className={`text-sm font-semibold ${status.state === "success" ? "text-forest" : "text-red-600"}`} role="status">
                {status.msg}
              </p>
            )}
            <button className="btn-green" onClick={submit} disabled={status.state === "loading"}>
              {status.state === "loading" ? "SENDING…" : "SEND MESSAGE"}
            </button>
          </div>
        </div>
      </section>

      <section className="container-g mt-10">
        <iframe id="our-location"
          title="Guruvan Foundation location map"
          src="https://www.google.com/maps?q=GROUND+FLOOR,+LS+NO+91,+Dalwada,+Banaskantha,+Gujarat,+India+385515&output=embed"
          className="h-72 w-full rounded-card border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}
