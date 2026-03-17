import type { Metadata } from "next";
import { bandName } from "@/lib/brand";
import { SongsBoard } from "@/app/songs/SongsBoard";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Our Songs",
    description: `${bandName} song board for the set list, suggested songs, and who's ready to play.`,
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
        <h1>Our Songs</h1>
        <p>Track the set list, suggested songs, and who&apos;s ready to play.</p>
      </section>

      <SongsBoard />
    </div>
  );
}
