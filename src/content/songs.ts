export type SongCategory = {
  title: string;
  description: string;
  songs: {
    title: string;
    artist: string;
  }[];
};

export const songCategories: SongCategory[] = [
  {
    title: "Classic Openers",
    description: "Strong songs that start a set with familiar energy.",
    songs: [
      { title: "American Girl", artist: "Tom Petty and the Heartbreakers" },
      { title: "Start Me Up", artist: "The Rolling Stones" },
      { title: "Hurt So Good", artist: "John Mellencamp" },
      { title: "Take the Money and Run", artist: "Steve Miller Band" },
      { title: "Life in the Fast Lane", artist: "Eagles" },
      { title: "Takin' Care of Business", artist: "Bachman-Turner Overdrive" },
      { title: "You Really Got Me (Van Halen version)", artist: "Van Halen" },
      { title: "Keep Your Hands to Yourself", artist: "Georgia Satellites" },
      { title: "Sharp Dressed Man", artist: "ZZ Top" },
      { title: "My Best Friend's Girl", artist: "The Cars" },
    ],
  },
  {
    title: "Story and Harmony",
    description: "Songs with melody and vocal focus for mixed-age crowds.",
    songs: [
      { title: "One of These Nights", artist: "Eagles" },
      { title: "No Matter What", artist: "Badfinger" },
      { title: "Birthday", artist: "The Beatles" },
      { title: "Hotel California", artist: "Eagles" },
      { title: "Bell Bottom Blues", artist: "Derek and the Dominos" },
      { title: "A Matter of Trust", artist: "Billy Joel" },
      { title: "Turn the Page", artist: "Bob Seger" },
      { title: "Listen to the Music", artist: "The Doobie Brothers" },
      { title: "Love Bites", artist: "Def Leppard" },
      { title: "Gimme Shelter", artist: "The Rolling Stones" },
    ],
  },
  {
    title: "Signature Riffs",
    description: "Big, recognizable rock songs that hit fast and keep the crowd locked in.",
    songs: [
      { title: "Mary Jane's Last Dance", artist: "Tom Petty and the Heartbreakers" },
      { title: "I Won't Back Down", artist: "Tom Petty" },
      { title: "Jealous Again", artist: "The Black Crowes" },
      { title: "Cocaine", artist: "Eric Clapton" },
      { title: "China Grove", artist: "The Doobie Brothers" },
      { title: "All Right Now", artist: "Free" },
      { title: "Rock and Roll", artist: "Led Zeppelin" },
      { title: "Sweet Emotion", artist: "Aerosmith" },
      { title: "Jailbreak", artist: "Thin Lizzy" },
      { title: "La Grange", artist: "ZZ Top" },
    ],
  },
  {
    title: "Singalong Favorites",
    description: "Easy-to-know songs that keep guests engaged.",
    songs: [
      { title: "Pink Cadillac", artist: "Bruce Springsteen" },
      { title: "Addicted to Love", artist: "Robert Palmer" },
      { title: "The Joker", artist: "Steve Miller Band" },
      { title: "Old Time Rock and Roll", artist: "Bob Seger" },
      { title: "Don't Stop Believin'", artist: "Journey" },
      { title: "Just What I Needed", artist: "The Cars" },
      { title: "Summer of '69", artist: "Bryan Adams" },
      { title: "Brown Eyed Girl", artist: "Van Morrison" },
      { title: "What I Like About You", artist: "The Romantics" },
      { title: "Bad to the Bone", artist: "George Thorogood & The Destroyers" },
    ],
  },
  {
    title: "Rock Drive",
    description: "Heavier songs for the middle-to-late part of the night.",
    songs: [
      { title: "Black Dog", artist: "Led Zeppelin" },
      { title: "Hells Bells", artist: "AC/DC" },
      { title: "Feel Like Makin' Love", artist: "Bad Company" },
      { title: "Dirty Deeds Done Dirt Cheap", artist: "AC/DC" },
      { title: "Panama", artist: "Van Halen" },
      { title: "Rock You Like a Hurricane", artist: "Scorpions" },
      { title: "Old Man Down the Road", artist: "John Fogerty" },
      { title: "The Stroke", artist: "Billy Squier" },
      { title: "Whole Lotta Love", artist: "Led Zeppelin" },
      { title: "My Sharona", artist: "The Knack" },
    ],
  },
  {
    title: "Closing Set Energy",
    description: "End-of-night songs that keep momentum to the finish.",
    songs: [
      { title: "Born to Be Wild", artist: "Steppenwolf" },
      { title: "Livin' on a Prayer", artist: "Bon Jovi" },
      { title: "We're an American Band", artist: "Grand Funk Railroad" },
      { title: "You Shook Me All Night Long", artist: "AC/DC" },
      { title: "Jump", artist: "Van Halen" },
      { title: "Get Back", artist: "The Beatles" },
      { title: "Come Together", artist: "The Beatles" },
      { title: "Riders on the Storm", artist: "The Doors" },
      { title: "Baby Blue", artist: "Badfinger" },
      { title: "All Day and All of the Night", artist: "The Kinks" },
    ],
  },
];
