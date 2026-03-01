import type { Metadata } from "next";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { bandName } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "EPK",
    description: `${bandName} electronic press kit structure with bio, promo image placeholders, and stage resources.`,
  };
}

export default function EpkPage() {
  return (
    <div className="container">
      <section className="page-header">
        <h1>EPK</h1>
        <p>Electronic press kit placeholders for venue talent buyers and event planners.</p>
      </section>

      <section className="section grid lg:grid-cols-2">
        <article className="panel">
          <SectionHeading eyebrow="Bio" title="Short bio (placeholder)" />
          <p>
            {bandName} is a premium classic rock act serving Montgomery, Conroe, and Houston with professional execution for
            upscale rooms.
          </p>
        </article>
        <article className="panel">
          <SectionHeading eyebrow="Bio" title="Long bio (placeholder)" />
          <p>
            Expand this section with full history, member bios, venue highlights, and performance philosophy once finalized.
          </p>
        </article>
        <article className="panel">
          <SectionHeading eyebrow="Photos" title="Promo photo download placeholders" />
          <ul style={{ paddingLeft: "1.1rem" }}>
            <li>Horizontal promo image - web</li>
            <li>Vertical promo image - social</li>
            <li>Transparent logo asset</li>
          </ul>
        </article>
        <article className="panel">
          <SectionHeading eyebrow="Tech" title="Stage plot / input list placeholders" />
          <ul style={{ paddingLeft: "1.1rem" }}>
            <li>Stage plot PDF placeholder</li>
            <li>Input list PDF placeholder</li>
            <li>Backline requirements summary</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
