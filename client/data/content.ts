export interface Work {
  title: string;
  slug: string;
  cover: string;
  excerpt: string;
  author: string;
  date: string; // ISO
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
    price: 10,
    published: true,
  },
  {
    title: "Letters to Nowhere",
    slug: "letters-to-nowhere",
    cover: "/placeholder.svg",
    excerpt: "Epistolary fragments from the edge of sleep.",
    price: 8,
    published: true,
  },
  {
    title: "Night Library",
    slug: "night-library",
    cover: "/placeholder.svg",
    excerpt: "Shelves that rearrange themselves after dusk.",
    price: 12,
    published: true,
  },
  {
    title: "Paper Bridges",
    slug: "paper-bridges",
    cover: "/placeholder.svg",
    excerpt: "Crossings between lives we almost lived.",
    price: 9,
    published: true,
  },
  {
    title: "Ink Weather",
    slug: "ink-weather",
    cover: "/placeholder.svg",
    excerpt: "Forecasts of moods and marginalia.",
    price: 11,
    published: true,
  },
  {
    title: "A Small Atlas",
    slug: "a-small-atlas",
    cover: "/placeholder.svg",
    excerpt: "Maps for rooms and conversations.",
    price: 7,
    published: true,
  },
  {
    title: "Window Songs",
    slug: "window-songs",
    cover: "/placeholder.svg",
    excerpt: "Lyrics overheard from the street.",
    price: 9,
    published: true,
  },
  {
    title: "Cloud Grammar",
    slug: "cloud-grammar",
    cover: "/placeholder.svg",
    excerpt: "Syntax for weather and wandering.",
    price: 10,
    published: true,
  },
  {
    title: "Thresholds",
    slug: "thresholds",
    cover: "/placeholder.svg",
    excerpt: "Short pieces about arrivals.",
    price: 6,
    published: true,
  },
  {
    title: "Two Rooms",
    slug: "two-rooms",
    cover: "/placeholder.svg",
    excerpt: "Conversations across a corridor.",
    price: 8,
    published: true,
  },
  {
    title: "Stone Letters",
    slug: "stone-letters",
    cover: "/placeholder.svg",
    excerpt: "Messages left for the future city.",
    price: 10,
    published: true,
  },
  {
    title: "Light Manual",
    slug: "light-manual",
    cover: "/placeholder.svg",
    excerpt: "Operating instructions for dawn.",
    price: 9,
    published: true,
  },
];

export const settings: Settings = {
  heroTextEn: "You found YCity’s little bookroom",
  heroTextZh: "你找到了 YCity 的小书房",
  nav: [],
  footer: [],
};
