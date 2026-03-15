import type { Metadata } from "next";
import Link from "next/link";
import { StreamVideo } from "@/components/StreamVideo";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { WaveformMotif } from "@/components/WaveformMotif";
import { testimonials } from "@/content/testimonials";
import { featuredVideos } from "@/content/videos";
import { bandName, brandTagline, ctaLabels } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Home",
    description:
      "Book The Feedback Committee for polished classic rock performances at upscale patios, country clubs, private celebrations, and corporate events in Montgomery, Conroe, and Houston.",
  };
}

type IdealForItem = {
  title: string;
  description: string;
  icon: "patio" | "club" | "corporate" | "private";
};

const idealFor: IdealForItem[] = [
  {
    title: "Upscale patios & established venues",
    description:
      "Polished classic rock tailored for hospitality-driven environments.",
    icon: "patio",
  },
  {
    title: "Country clubs & member events",
    description:
      "Professional stage presence and a repertoire that fits club standards.",
    icon: "club",
  },
  {
    title: "Corporate receptions & client nights",
    description:
      "Controlled volume, clean production, and reliable pacing for networking-focused events.",
    icon: "corporate",
  },
  {
    title: "Private celebrations & milestone evenings",
    description:
      "Energy that builds naturally from dinner ambience to confident singalong moments.",
    icon: "private",
  },
];

function IdealForIcon({ icon }: { icon: IdealForItem["icon"] }) {
  if (icon === "patio") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 19h16M12 5v14M6 9h12M8.5 9l-3-3M15.5 9l3-3" />
      </svg>
    );
  }

  if (icon === "club") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" />
      </svg>
    );
  }

  if (icon === "corporate") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M3 20h18M5 20V8h14v12M9 8V5h6v3M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01M15 15h.01" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 20h16M6 20V9l6-4 6 4v11M10 13h4M10 16h4" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="container">
      <section className="page-header">
        <WaveformMotif />
        <div className="hero-panel-glow" />
        <p className="eyebrow">Montgomery | Conroe | Houston</p>
        <h1>{bandName}</h1>
        <p>
          {brandTagline} Built for venues that value strong musicianship, clean
          presentation, and reliable event execution.
        </p>
        <div className="hero-support">
          <div className="hero-badge-row">
            <span className="hero-badge">
              <span className="signal-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <strong>Classic Rock</strong> tuned for premium rooms
            </span>
            <span className="hero-badge">
              <strong>Clean Stage Presence</strong> and controlled volume
            </span>
            <span className="hero-badge">
              <strong>Venue-ready</strong> load-in, pacing, and professionalism
            </span>
          </div>
        </div>
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
        <div className="hero-badge-row" style={{ marginBottom: "1rem" }}>
          <span className="hero-badge">
            <strong>Warm-room energy</strong> without crowding the room
          </span>
          <span className="hero-badge">
            <strong>Classic material</strong> with a polished live feel
          </span>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3">
          {featuredVideos.map((video) => (
            <StreamVideo key={video.uid} uid={video.uid} title={video.title} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Ideal For"
          title="Upscale venues and hospitality spaces"
          description="We perform classic rock with polish and control, keeping volume balanced so guests can enjoy the music without losing conversation, while our intentional set flow supports your staff and the overall atmosphere of your room."
        />
        <div className="grid md:grid-cols-2">
          {idealFor.map((item) => (
            <article key={item.title} className="panel">
              <span
                className="motif-ring"
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  color: "var(--secondary-soft)",
                  background:
                    "color-mix(in srgb, var(--surface-muted) 92%, var(--highlight))",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <IdealForIcon icon={item.icon} />
              </span>
              <h3
                style={{
                  fontSize: "1.2rem",
                  lineHeight: 1.2,
                  marginTop: "0.7rem",
                }}
              >
                {item.title}
              </h3>
              <p style={{ marginTop: "0.55rem", color: "var(--foreground-muted)" }}>
                {item.description}
              </p>
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
            <article key={testimonial.source} className="panel testimonial-card">
              <span className="testimonial-mark" aria-hidden="true">
                "
              </span>
              <p style={{ fontStyle: "italic", color: "var(--foreground-muted)" }}>
                &quot;{testimonial.quote}&quot;
              </p>
              <p
                className="testimonial-source"
                style={{
                  marginTop: "0.7rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--secondary-soft)",
                }}
              >
                {testimonial.source}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section panel booking-panel"
        style={{
          marginBottom: "1rem",
          background:
            "radial-gradient(circle at top left, rgba(212, 163, 115, 0.12) 0, transparent 26%), linear-gradient(135deg, rgba(200, 90, 17, 0.1) 0%, rgba(29, 36, 48, 0.9) 48%, rgba(11, 13, 16, 1) 100%)",
        }}
      >
        <SectionHeading
          eyebrow="Booking"
          title="Secure your date now"
          description="Use the booking form to share event details, timeline, and budget range so we can respond with an exact-fit quote."
        />
        <div className="booking-pill-row" style={{ marginBottom: "0.95rem" }}>
          <span className="booking-pill">
            <strong>Fast response</strong> for serious booking inquiries
          </span>
          <span className="booking-pill">
            <strong>Set pacing</strong> designed around your room
          </span>
          <span className="booking-pill">
            <strong>Professional execution</strong> from load-in to encore
          </span>
        </div>
        <div className="cta-row">
          <Link href="/book" className="button-primary">
            {ctaLabels.primary}
          </Link>
        </div>
      </section>
    </div>
  );
}
