import { songCategories } from "@/content/songs";

export type SongStage = "active" | "selected" | "suggested" | "archived";
export type SongConfidence = "dont_know" | "kind_of_know" | "know_it";

export function slugifySongPart(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSongSlug(title: string, artist: string) {
  return `${slugifySongPart(title)}--${slugifySongPart(artist)}`;
}

export const defaultSongCatalog = songCategories
  .flatMap((category) => category.songs)
  .map((song, index) => ({
    ...song,
    slug: getSongSlug(song.title, song.artist),
    sortOrder: index,
    status: "active" as const,
  }));

export const validSongSlugs = new Set(defaultSongCatalog.map((song) => song.slug));

export const songConfidenceLabels: Record<SongConfidence, string> = {
  dont_know: "I don't know it",
  kind_of_know: "I kind of know it",
  know_it: "I know it",
};

export const songConfidenceOpacity: Record<SongConfidence, number> = {
  dont_know: 0.25,
  kind_of_know: 0.6,
  know_it: 1,
};
