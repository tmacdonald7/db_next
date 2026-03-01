import type { Metadata } from "next";
import { StreamVideo } from "@/components/StreamVideo";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { featuredVideos } from "@/content/videos";
import { bandName } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Media",
    description: `Watch and review ${bandName} performance media for venue and event planning in Montgomery, Conroe, and Houston.`,
  };
}

const photoPlaceholders = [
  "Stage setup in warm evening light",
  "Audience-facing trio shot",
  "Corporate reception performance frame",
  "Country club patio wide shot",
  "Lead vocal close-up",
  "Full band load-out ready frame",
];

export default function MediaPage() {
  return (
    <div className="container">
      <section className="page-header">
        <h1>Media</h1>
        <p>Cloudflare Stream embeds and photo gallery placeholders for booking packets and venue review.</p>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Video" title="Performance video gallery" />
        <div className="grid md:grid-cols-2 xl:grid-cols-3">
          {featuredVideos.map((video) => (
            <StreamVideo key={video.uid} uid={video.uid} title={video.title} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Photo"
          title="Photo gallery placeholders"
          description="Swap these placeholders with final promo photos once approved for web and EPK usage."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {photoPlaceholders.map((photo) => (
            <article key={photo} className="panel" style={{ minHeight: "10rem", display: "grid", placeItems: "center" }}>
              <p style={{ textAlign: "center", color: "color-mix(in srgb, var(--foreground) 70%, #fff)" }}>{photo}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
