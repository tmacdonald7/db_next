import type { Metadata } from "next";
import { bandName } from "@/lib/brand";
import { SongsBoard } from "@/app/songs/SongsBoard";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Song List",
    description: `${bandName} band song board for tracking readiness, voting suggested songs into the set list, and organizing the active sets.`,
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
          Use the thumbs up to vote a song into the active set list. When all band
          members give it a thumbs up, it moves from suggested songs to the active
          set list. Then mark how ready you are: Not Ready, Almost Ready, or Ready.
          You can drag songs in the active set list to change the order and use
          Export PDF to print or save the sets.
        </p>
      </section>

      <SongsBoard />
    </div>
  );
}
