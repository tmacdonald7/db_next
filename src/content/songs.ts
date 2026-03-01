export type SongCategory = {
  title: string;
  description: string;
  songs: string[];
};

export const songCategories: SongCategory[] = [
  {
    title: "Harmony Classics",
    description: "Eagles and Beatles lane for polished vocal-forward sets.",
    songs: [
      "Take It Easy - Eagles",
      "Already Gone - Eagles",
      "Here Comes the Sun - The Beatles",
      "Let It Be - The Beatles",
      "America - Simon & Garfunkel",
    ],
  },
  {
    title: "Groove & Crowd",
    description: "Tom Petty and Robert Palmer lane for steady energy.",
    songs: [
      "American Girl - Tom Petty",
      "Runnin' Down a Dream - Tom Petty",
      "Bad Case of Loving You - Robert Palmer",
      "Long Train Runnin' - The Doobie Brothers",
      "Sultans of Swing - Dire Straits",
    ],
  },
  {
    title: "Danceable Nostalgia",
    description: "80s crossover songs with familiar hooks.",
    songs: [
      "You Make My Dreams - Hall & Oates",
      "Footloose - Kenny Loggins",
      "Jessie's Girl - Rick Springfield",
      "Summer of '69 - Bryan Adams",
      "Don't You (Forget About Me) - Simple Minds",
    ],
  },
];
