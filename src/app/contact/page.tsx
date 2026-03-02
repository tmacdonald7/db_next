import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/app/contact/ContactForm";
import { bandName } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact",
    description: `Contact ${bandName} for booking availability in Montgomery, Conroe, and Houston.`,
  };
}

export default function ContactPage() {
  return (
    <div className="container">
      <section className="page-header">
        <h1>Contact</h1>
        <p>Use the options below to start a booking conversation for your venue or event.</p>
      </section>

      <section className="section grid lg:grid-cols-2">
        <article className="panel">
          <h2 style={{ fontSize: "1.3rem", lineHeight: 1.2 }}>Booking Inquiry Form</h2>
          <p style={{ marginTop: "0.6rem" }}>
            For the fastest response, submit your event details through our booking form.
          </p>
          <div className="cta-row">
            <Link href="/book" className="button-primary">
              Go to Booking Form
            </Link>
          </div>
        </article>

        <ContactForm />
      </section>
    </div>
  );
}
