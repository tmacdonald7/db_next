export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  city: string;
  seoDescription: string;
  body: string[];
};

export const blogPosts: Post[] = [
  {
    slug: "booking-a-classic-rock-band-in-conroe",
    title: "Booking a Classic Rock Band in Conroe: Venue Planning Notes",
    excerpt:
      "A practical checklist for venue teams and hosts in Conroe booking polished live classic rock entertainment.",
    publishedAt: "2026-02-15",
    city: "Conroe",
    seoDescription:
      "How to book a classic rock band in Conroe with clear timing, setup, and budget expectations for upscale events.",
    body: [
      "Conroe venues benefit most from live music when event goals are clear before outreach. Start with atmosphere intent: background-forward dinner, social-hour groove, or dance-focused close.",
      "For upscale rooms, request a two- or three-set flow with planned energy progression. This keeps volume and pacing aligned with food service and guest transitions.",
      "Band logistics should include load-in access, stage dimensions, and power details before contracts are finalized. Clear backline planning prevents day-of delays.",
    ],
  },
  {
    slug: "houston-corporate-event-music-guide",
    title: "Houston Corporate Event Music Guide: Classic Rock Done Right",
    excerpt:
      "How Houston planners use familiar repertoire and controlled stage presentation for premium corporate events.",
    publishedAt: "2026-02-22",
    city: "Houston",
    seoDescription:
      "Houston corporate event music strategy for booking a refined classic rock band with professional execution.",
    body: [
      "Houston corporate events often need music that reads as polished, familiar, and brand-safe. Classic rock standards can deliver exactly that when curation and stage conduct are intentional.",
      "Confirm schedule anchors in writing: first downbeat, break timing, and hard stop. This helps the venue, catering team, and AV support align around one timeline.",
      "Ask for a song-lane approach in advance. Grouping repertoire into harmony-forward classics, groove staples, and danceable nostalgia keeps set planning predictable for mixed guest groups.",
    ],
  },
  {
    slug: "montgomery-country-club-live-music-tips",
    title: "Montgomery Country Club Live Music Tips for Elegant Evenings",
    excerpt:
      "Planning notes for Montgomery country clubs that want a classic rock soundtrack without a bar-band feel.",
    publishedAt: "2026-02-28",
    city: "Montgomery",
    seoDescription:
      "Montgomery country club music planning with a polished classic rock band approach for refined member events.",
    body: [
      "Country club events in Montgomery usually require precise volume discipline. The best result comes from setting expected decibel ranges before show day.",
      "Music should support conversation early, then widen into crowd sing-alongs as the evening matures. This progression keeps both dining and dance segments successful.",
      "Event hosts should confirm dress code, stage footprint, and MC announcements as part of the booking brief so production feels cohesive from arrival to close.",
    ],
  },
];
