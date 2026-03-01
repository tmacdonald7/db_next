import type { Metadata } from "next";
import Link from "next/link";
import { StreamVideo } from "@/components/StreamVideo";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { testimonials } from "@/content/testimonials";
import { featuredVideos } from "@/content/videos";
import { bandName, brandTagline, ctaLabels } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Home",
    description:
      "Book The Decibels for polished classic rock performances at upscale patios, country clubs, private celebrations, and corporate events in Montgomery, Conroe, and Houston.",
  };
}

const idealFor = [
  "Upscale patios and restaurant rooms",
  "Country clubs and member events",
  "Corporate receptions and client nights",
  "Private celebrations and milestone evenings",
];

export default function HomePage() {
  return (
    <div className="container">
      <section className="page-header">
        <p className="eyebrow">Montgomery | Conroe | Houston</p>
        <h1>{bandName}</h1>
        <p>{brandTagline} Built for venues that value strong musicianship, clean presentation, and reliable event execution.</p>
        <div className="cta-row">
          <Link href="/book" className="button-primary">
            {ctaLabels.primary}
          </Link>
          <Link href="/media" className="button-secondary">
            {ctaLabels.secondary}
          </Link>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Performance Video"
          title="Live clips from recent sets"
          description="Replace these placeholder Cloudflare Stream IDs with your final library as soon as media is approved."
        />
        <div className="grid md:grid-cols-2 xl:grid-cols-3">
          {featuredVideos.map((video) => (
            <StreamVideo key={video.uid} uid={video.uid} title={video.title} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Ideal For"
          title="Designed for refined rooms"
          description="Set lists and stage approach are built to support premium hospitality environments rather than loud bar-band pacing."
        />
        <div className="grid md:grid-cols-2">
          {idealFor.map((item) => (
            <article key={item} className="panel">
              <h3 style={{ fontSize: "1.2rem", lineHeight: 1.2 }}>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Testimonials"
          title="What venue partners say"
          description="Placeholder testimonials for MVP. Swap with approved quotes and attribution once available."
        />
        <div className="grid md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.source} className="panel">
              <p style={{ fontStyle: "italic" }}>&quot;{testimonial.quote}&quot;</p>
              <p style={{ marginTop: "0.7rem", fontSize: "0.9rem", fontWeight: 600 }}>{testimonial.source}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section panel" style={{ marginBottom: "1rem" }}>
        <SectionHeading
          eyebrow="Booking"
          title="Secure your date now"
          description="Use the booking form to share event details, timeline, and budget range so we can respond with an exact-fit quote."
        />
        <div className="cta-row">
          <Link href="/book" className="button-primary">
            {ctaLabels.primary}
          </Link>
        </div>
      </section>
    </div>
  );
}
