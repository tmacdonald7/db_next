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

type IdealForItem = {
  title: string;
  description: string;
  icon: "patio" | "club" | "corporate" | "private";
};

const idealFor: IdealForItem[] = [
  {
    title: "Upscale patios and restaurant rooms",
    description: "Balanced volume and polished pacing that supports hospitality service and guest conversation.",
    icon: "patio",
  },
  {
    title: "Country clubs and member events",
    description: "Classic repertoire and professional stage presence tailored for club standards and member expectations.",
    icon: "club",
  },
  {
    title: "Corporate receptions and client nights",
    description: "Reliable set flow and clean production for networking-focused events and brand-safe entertainment.",
    icon: "corporate",
  },
  {
    title: "Private celebrations and milestone evenings",
    description: "Personalized set energy that shifts from dinner ambience to singalong moments at the right time.",
    icon: "private",
  },
];

function IdealForIcon({ icon }: { icon: IdealForItem["icon"] }) {
  if (icon === "patio") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19h16M12 5v14M6 9h12M8.5 9l-3-3M15.5 9l3-3" />
      </svg>
    );
  }

  if (icon === "club") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" />
      </svg>
    );
  }

  if (icon === "corporate") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 20h18M5 20V8h14v12M9 8V5h6v3M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01M15 15h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20h16M6 20V9l6-4 6 4v11M10 13h4M10 16h4" />
    </svg>
  );
}

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
            <article key={item.title} className="panel">
              <span
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  color: "var(--accent-deep)",
                  background: "color-mix(in srgb, var(--surface-muted) 82%, #fff)",
                }}
              >
                <IdealForIcon icon={item.icon} />
              </span>
              <h3 style={{ fontSize: "1.2rem", lineHeight: 1.2, marginTop: "0.7rem" }}>{item.title}</h3>
              <p style={{ marginTop: "0.55rem" }}>{item.description}</p>
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
