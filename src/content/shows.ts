export type ShowItem = {
  id: string;
  date: string;
  venue: string;
  city: string;
  notes: string;
};

export const upcomingShows: ShowItem[] = [
  {
    id: "show-2026-03-21",
    date: "2026-03-21",
    venue: "Blue Heron Patio Room",
    city: "Conroe, TX",
    notes: "Dinner set, reservations recommended.",
  },
  {
    id: "show-2026-04-11",
    date: "2026-04-11",
    venue: "Montgomery Lakes Country Club",
    city: "Montgomery, TX",
    notes: "Members and guests event.",
  },
  {
    id: "show-2026-05-02",
    date: "2026-05-02",
    venue: "Riverpoint Corporate Terrace",
    city: "Houston, TX",
    notes: "Private corporate booking.",
  },
];
