import type { Metadata } from "next";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { songCategories } from "@/content/songs";
import { bandName } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Song List",
    description: `${bandName} song list for Montgomery, Conroe, and Houston events, organized by mood and audience response.`,
  };
}

export default function SongsPage() {
  return (
    <div className="container">
      <section className="page-header">
        <h1>Song List</h1>
        <p>Curated for quick review by venue managers, planners, and hosts selecting set direction.</p>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Repertoire Lanes"
          title="Categorized for skimming"
          description="Each lane supports a different room energy profile while preserving a classic rock identity."
        />
        <div className="grid lg:grid-cols-3">
          {songCategories.map((category) => (
            <article key={category.title} className="panel">
              <h2 style={{ fontSize: "1.4rem", lineHeight: 1.2 }}>{category.title}</h2>
              <p style={{ marginTop: "0.55rem" }}>{category.description}</p>
              <ul style={{ marginTop: "0.8rem", paddingLeft: "1.1rem" }}>
                {category.songs.map((song) => (
                  <li key={song} style={{ marginTop: "0.35rem" }}>
                    {song}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
