import type { Metadata } from "next";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { upcomingShows } from "@/content/shows";
import { bandName } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shows",
    description: `Upcoming ${bandName} shows in Montgomery, Conroe, and Houston. Static JSON data for MVP, database later.`,
  };
}

export default function ShowsPage() {
  return (
    <div className="container">
      <section className="page-header">
        <h1>Shows</h1>
        <p>Upcoming performances. Data is currently static and can be replaced with a database feed later.</p>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Upcoming" title="Current schedule" />
        <div className="grid">
          {upcomingShows.map((show) => (
            <article key={show.id} className="panel">
              <h2 style={{ fontSize: "1.3rem", lineHeight: 1.2 }}>{show.venue}</h2>
              <p style={{ marginTop: "0.4rem" }}>
                <span className="date-block">Date: {show.date}</span> |{" "}
                <span className="date-block">City: {show.city}</span>
              </p>
              <p style={{ marginTop: "0.45rem" }}>{show.notes}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
