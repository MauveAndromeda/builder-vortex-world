export interface Work {
  title: string;
  slug: string;
  cover: string;
  excerpt: string;
  author: string;
  date: string; // ISO
  tags?: string[];
  price?: number;
  published: boolean;
}

export interface Chapter {
  work: string; // slug
  order: number;
  title: string;
  content: string;
  price?: number;
}

export interface Settings {
  heroTextEn: string;
  heroTextZh: string;
  nav: { label: string; href: string }[];
  footer: { label: string; href: string }[];
}

export const works: Work[] = [
  {
    title: "The Silent City",
    slug: "the-silent-city",
    cover: "/placeholder.svg",
    excerpt: "A meditation on memory and metropolis.",
    author: "YCity Collective",
    date: "2025-01-10",
    tags: ["city", "essay"],
    price: 10,
    published: true,
  },
  {
    title: "Letters to Nowhere",
    slug: "letters-to-nowhere",
    cover: "/placeholder.svg",
    excerpt: "Epistolary fragments from the edge of sleep.",
    author: "M. Y.",
    date: "2024-11-02",
    tags: ["letters", "fiction"],
    price: 8,
    published: true,
  },
  {
    title: "Night Library",
    slug: "night-library",
    cover: "/placeholder.svg",
    excerpt: "Shelves that rearrange themselves after dusk.",
    author: "Y. Chen",
    date: "2024-08-22",
    tags: ["library", "short"],
    price: 12,
    published: true,
  },
  {
    title: "Paper Bridges",
    slug: "paper-bridges",
    cover: "/placeholder.svg",
    excerpt: "Crossings between lives we almost lived.",
    author: "L. Zhou",
    date: "2024-05-05",
    tags: ["memoir"],
    price: 9,
    published: true,
  },
  {
    title: "Ink Weather",
    slug: "ink-weather",
    cover: "/placeholder.svg",
    excerpt: "Forecasts of moods and marginalia.",
    author: "YCity Collective",
    date: "2023-12-19",
    tags: ["poetry"],
    price: 11,
    published: true,
  },
  {
    title: "A Small Atlas",
    slug: "a-small-atlas",
    cover: "/placeholder.svg",
    excerpt: "Maps for rooms and conversations.",
    author: "M. Y.",
    date: "2023-07-14",
    tags: ["maps", "essay"],
    price: 7,
    published: true,
  },
  {
    title: "Window Songs",
    slug: "window-songs",
    cover: "/placeholder.svg",
    excerpt: "Lyrics overheard from the street.",
    author: "Y. Chen",
    date: "2023-04-03",
    tags: ["street", "lyrics"],
    price: 9,
    published: true,
  },
  {
    title: "Cloud Grammar",
    slug: "cloud-grammar",
    cover: "/placeholder.svg",
    excerpt: "Syntax for weather and wandering.",
    author: "L. Zhou",
    date: "2022-11-23",
    tags: ["weather"],
    price: 10,
    published: true,
  },
  {
    title: "Thresholds",
    slug: "thresholds",
    cover: "/placeholder.svg",
    excerpt: "Short pieces about arrivals.",
    author: "YCity Collective",
    date: "2022-07-09",
    tags: ["short"],
    price: 6,
    published: true,
  },
  {
    title: "Two Rooms",
    slug: "two-rooms",
    cover: "/placeholder.svg",
    excerpt: "Conversations across a corridor.",
    author: "M. Y.",
    date: "2022-01-30",
    tags: ["dialogue"],
    price: 8,
    published: true,
  },
  {
    title: "Stone Letters",
    slug: "stone-letters",
    cover: "/placeholder.svg",
    excerpt: "Messages left for the future city.",
    author: "Y. Chen",
    date: "2021-10-12",
    tags: ["future", "letters"],
    price: 10,
    published: true,
  },
  {
    title: "Light Manual",
    slug: "light-manual",
    cover: "/placeholder.svg",
    excerpt: "Operating instructions for dawn.",
    author: "L. Zhou",
    date: "2021-02-18",
    tags: ["manual"],
    price: 9,
    published: true,
  },
];

export const chapters: Chapter[] = [
  {
    work: "the-silent-city",
    order: 1,
    title: "Prologue",
    content:
      "The city wakes like paper, thin light sliding under the doorframes. Elevators yawn, kettles murmur, and every window becomes a soft lens that remembers the night. I walk the first block with pockets full of tickets and old receipts, reading their dates as if they were coordinates. A tram passes and leaves a ribbon of wind; a sparrow edits the morning with three quick notes. By the time the bakery opens, the street has learned my footsteps and offers them back in echo.",
    price: 1,
  },
  {
    work: "the-silent-city",
    order: 2,
    title: "Bridges",
    content:
      "Between buildings, a hush thick as felt. The river wears its bridges like bookmarks, each one saving a chapter of crossings: commuters, confessions, errands that turn into detours. I stop at the center span and look down; coins glitter in the silt like punctuation. Someone on the far bank waves, or maybe they are just talking with their hands. I answer anyway. We compromise on a language of shoulders and breath.",
    price: 2,
  },
  {
    work: "letters-to-nowhere",
    order: 1,
    title: "Postmark",
    content:
      "No return address, only a faint ring where a glass once stood. The envelope is the color of weather; its flap remembers being a wing. I hold it to the window and see a silhouette of words, the way bones show through an X‑ray. When I finally tear it open, a dry wind leaves, as if the paper itself had been breathing all night inside my desk.",
    price: 1,
  },
  {
    work: "letters-to-nowhere",
    order: 2,
    title: "Sleepless",
    content:
      "Ink at 3 a.m., slow as tide. The apartment is a harbor for small noises: the radiator ticking east, the neighbor’s steps crossing a sea of floorboards. I write on the back of receipts and metro maps, anything with a coastline. By the time the first tram coughs awake, the page has become a room and I am walking through it, turning off lights, touching the frames.",
    price: 2,
  },
];

export function getChaptersByWork(slug: string) {
  return chapters
    .filter((c) => c.work === slug)
    .sort((a, b) => a.order - b.order);
}

export const settings: Settings = {
  heroTextEn: "You found YCity’s little bookroom",
  heroTextZh: "恭喜你发现了伊城的小书屋",
  nav: [],
  footer: [],
};
