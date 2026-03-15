import type { Metadata } from "next";
import { bandName } from "@/lib/brand";
import { SongsBoard } from "@/app/songs/SongsBoard";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Song List",
    description: `${bandName} internal repertoire board for working songs, band readiness, and suggested additions.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SongsPage() {
  return (
    <div className="container">
      <section className="page-header">
        <h1>Song List</h1>
        <p>
          Internal band board for active songs, next-up selections, member confidence,
          and set suggestions.
        </p>
      </section>

      <SongsBoard />
    </div>
  );
}
