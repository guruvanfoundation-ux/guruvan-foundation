import PageHero from "../components/PageHero.jsx";
import IMG from "../lib/images.js";

/**
 * Privacy, Terms and Refund pages. Razorpay's activation review looks for all
 * three, so they share one layout and are kept deliberately plain and specific.
 *
 * These are drafts written from the foundation's own details — have a lawyer or
 * CA read them before launch, and keep the "last updated" date current.
 */

const ORG = {
  name: "Guruvan Foundation",
  cin: "U85500GJ2026NPL179944",
  pan: "AANCG1787C",
  address: "Dalwada, Palanpur, Banaskantha – 385515, Gujarat, India",
  email: "guruvanfoundation@gmail.com",
  phone: "+91 90234 35636",
  site: "guruvanfoundation.org",
};

const UPDATED = "22 August 2026";

function Legal({ title, image, intro, sections }) {
  return (
    <>
      <PageHero title={title} image={image} />
      <section className="container-g mt-10 mb-16">
        <div className="card p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-600">
            Last updated {UPDATED}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/75">{intro}</p>

          <div className="mt-8 space-y-8">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-lg font-bold text-forest-900">{s.heading}</h2>
                {s.body?.map((para, i) => (
                  <p key={i} className="mt-2 text-sm leading-relaxed text-ink/75">{para}</p>
                ))}
                {s.list && (
                  <ul className="mt-3 space-y-1.5 pl-5 text-sm leading-relaxed text-ink/75">
                    {s.list.map((item) => (
                      <li key={item} className="list-disc">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-card bg-forest-tint p-5">
            <h2 className="text-sm font-bold text-forest-900">Contact us</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">
              {ORG.name} · Section 8 non-profit · CIN {ORG.cin} · PAN {ORG.pan}
              <br />
              {ORG.address}
              <br />
              <a className="text-forest-700 hover:underline" href={`mailto:${ORG.email}`}>{ORG.email}</a>
              {" · "}
              <a className="text-forest-700 hover:underline" href={`tel:${ORG.phone.replace(/\s/g, "")}`}>{ORG.phone}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export function PrivacyPolicy() {
  return (
    <Legal
      title="Privacy Policy"
      image={IMG.saplingHands}
      intro={`${ORG.name} respects your privacy. This policy explains what we collect when you donate, volunteer or contact us through ${ORG.site}, why we collect it, and what we do with it.`}
      sections={[
        {
          heading: "Information we collect",
          body: ["We only ask for what we need to process your donation, issue a receipt, or respond to you."],
          list: [
            "Donations: your name, email address, phone number and postal address. PAN is collected where you request an 80G tax receipt, because the Income Tax Department requires it.",
            "Volunteer sign-ups: your name, email, phone, city and area of interest, plus anything you write in the message field.",
            "Contact form: your name, email, subject and message.",
            "Technical data: standard web server logs, which include IP address and browser type.",
          ],
        },
        {
          heading: "Payment information",
          body: [
            "We do not collect or store your card, UPI or bank details. Payments are processed by Razorpay Software Private Limited, and those details are handled entirely on Razorpay's systems under their privacy policy and PCI-DSS obligations. We receive only a payment reference, the amount, and the method used.",
          ],
        },
        {
          heading: "How we use your information",
          list: [
            "To process your donation and email you a receipt and certificate of appreciation.",
            "To issue an 80G certificate and meet our reporting obligations under Indian tax law.",
            "To reply to volunteer applications and enquiries.",
            "To send occasional updates about our work, only where you have asked to receive them.",
          ],
        },
        {
          heading: "Who we share it with",
          body: [
            "We do not sell or rent your personal information. We share it only with the service providers needed to run the foundation — our payment gateway (Razorpay), our email provider, and our database and hosting providers — and with government authorities where the law requires it, such as donation reporting to the Income Tax Department.",
          ],
        },
        {
          heading: "How long we keep it",
          body: [
            "Donation records, including the details printed on your receipt, are retained for at least eight years as required for tax and audit purposes. Volunteer and enquiry records are kept only as long as they remain useful, and are deleted on request.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            `You can ask us for a copy of the personal information we hold about you, ask us to correct it, or ask us to delete it where we are not required by law to keep it. Write to ${ORG.email} and we will respond within 30 days.`,
          ],
        },
        {
          heading: "Security",
          body: [
            "The site is served over HTTPS, and administrative access to donor records is password protected. No system is perfectly secure, but we take reasonable measures to protect the information you give us.",
          ],
        },
        {
          heading: "Changes to this policy",
          body: [
            "We may update this policy from time to time. The date at the top of this page shows when it was last revised.",
          ],
        },
      ]}
    />
  );
}

export function TermsOfUse() {
  return (
    <Legal
      title="Terms of Use"
      image={IMG.planting}
      intro={`By using ${ORG.site} or making a donation to ${ORG.name}, you agree to these terms.`}
      sections={[
        {
          heading: "About us",
          body: [
            `${ORG.name} is a non-profit company registered under Section 8 of the Companies Act, 2013 (CIN ${ORG.cin}), with its registered office at ${ORG.address}.`,
          ],
        },
        {
          heading: "Donations",
          list: [
            "Donations are voluntary and are made to support our work in environment, education and health.",
            "You receive no goods, services or other benefit in exchange for a donation.",
            "We allocate funds to the programme you select where one is specified; otherwise funds go where the need is greatest at the time.",
            "Donations from outside India are not accepted at present, as we are not registered under the Foreign Contribution (Regulation) Act.",
            "You confirm that the funds you donate are your own and are from a lawful source.",
          ],
        },
        {
          heading: "Tax receipts",
          body: [
            "A receipt is emailed for every successful donation. Eligibility for deduction under Section 80G depends on our registration status at the time of your donation and on your own tax position; the receipt states the position that applies.",
          ],
        },
        {
          heading: "Accuracy of the information you give us",
          body: [
            "Please make sure your name, PAN and contact details are correct. A receipt cannot be corrected after it has been reported to the Income Tax Department, and an incorrect PAN may prevent you from claiming a deduction.",
          ],
        },
        {
          heading: "Use of this website",
          list: [
            "The content, logo, photographs and text on this site belong to the foundation and may not be reproduced for commercial purposes without written permission.",
            "You agree not to attempt to disrupt the site, gain unauthorised access to it, or use it for any unlawful purpose.",
            "The site may link to other websites. We are not responsible for their content or their privacy practices.",
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "We publish the information on this site in good faith, but we do not warrant that it is complete or error free. To the extent permitted by law, the foundation is not liable for any loss arising from your use of the site.",
          ],
        },
        {
          heading: "Governing law",
          body: [
            "These terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts at Palanpur, Banaskantha, Gujarat.",
          ],
        },
      ]}
    />
  );
}

export function RefundPolicy() {
  return (
    <Legal
      title="Refund Policy"
      image={IMG.donateJar}
      intro={`Donations to ${ORG.name} are voluntary contributions towards our work, and are generally not refundable. We recognise that genuine mistakes happen, and this policy explains how we handle them.`}
      sections={[
        {
          heading: "When we will refund a donation",
          body: ["We will consider a refund where:"],
          list: [
            "The same donation was charged more than once because of a technical error.",
            "The amount deducted differs from the amount you authorised.",
            "You entered an incorrect amount and tell us within 7 days of the donation.",
            "A payment was made without the account holder's authorisation.",
          ],
        },
        {
          heading: "How to request a refund",
          body: [
            `Email ${ORG.email} within 7 days of the donation with your receipt number, the donation date, the amount and a short explanation. You can also call us on ${ORG.phone}.`,
          ],
        },
        {
          heading: "How refunds are processed",
          body: [
            "Approved refunds are returned to the original payment method through Razorpay. The money usually reaches your account within 5 to 7 working days, depending on your bank. We do not make refunds in cash or to a different account.",
          ],
        },
        {
          heading: "Effect on your tax receipt",
          body: [
            "If a donation is refunded, the receipt issued for it becomes void and cannot be used to claim a deduction under Section 80G. Where a certificate has already been issued, we will cancel it and confirm this to you in writing.",
          ],
        },
        {
          heading: "Failed and pending payments",
          body: [
            "If money left your account but the donation does not appear as successful, it is usually held by the payment gateway and reversed automatically within 5 to 7 working days. If it has not been returned after that, contact us with the transaction reference and we will trace it with Razorpay.",
          ],
        },
        {
          heading: "Monthly donations",
          body: [
            "You can stop a recurring donation at any time by writing to us. Payments already collected before you cancel are not refunded, since those funds are typically committed to programmes already under way.",
          ],
        },
      ]}
    />
  );
}
