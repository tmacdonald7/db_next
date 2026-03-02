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
        <p>Our current working set list is grouped for easy planning across different event moments.</p>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Repertoire"
          title="Song Categories"
          description="Song titles are in italics and artist names are bold for faster scanning."
        />
        <div className="grid md:grid-cols-2">
          {songCategories.map((category) => (
            <article key={category.title} className="panel">
              <h2 style={{ fontSize: "1.4rem", lineHeight: 1.2 }}>{category.title}</h2>
              <p style={{ marginTop: "0.55rem" }}>{category.description}</p>
              <ul className="song-list">
                {category.songs.map((song) => (
                  <li key={`${song.title}-${song.artist}`}>
                    <span className="song-title">{song.title}</span> by{" "}
                    <span className="song-artist">{song.artist}</span>
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
