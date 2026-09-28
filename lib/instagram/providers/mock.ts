import "server-only";
import { InstagramError } from "../types";
import type {
  InstagramProvider,
  MediaItem,
  Post,
  Profile,
  StoryItem,
} from "../types";

/**
 * Deterministic fake data for building the UI without hitting Instagram.
 * Enable with IG_PROVIDER=mock. Sessions are accepted and ignored.
 */

const SAMPLE_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const SQUARE = 1080;
const PORTRAIT_HEIGHT = 1350;
const STORY_HEIGHT = 1920;
const AVATAR_SIZE = 320;
const PAGE_SIZE = 12;
const LAST_PAGE = 4;
const DAY_SECONDS = 86_400;
const HOUR_SECONDS = 3600;
const BASE36 = 36;
const POSTED_AT = Math.floor(Date.UTC(2026, 8, 20) / 1000);
const STORY_AT = Math.floor(Date.UTC(2026, 8, 27) / 1000);

const img = (seed: string, width = SQUARE, height = SQUARE) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

const CAPTIONS = [
  "Golden hour over the ridge. Worth the 5am alarm ☀️ #landscape #hiking",
  "New studio setup is finally done. Swipe for the before/after →",
  "Tiny details from this week's shoot.",
  "Late-night city walks 🌃",
  "Coffee, film, repeat.",
  "Behind the scenes of our latest project 🎬",
];

const image = (seed: string, height = SQUARE): MediaItem => ({
  height,
  thumbnail: img(seed, SQUARE, height),
  type: "image",
  url: img(seed, SQUARE, height),
  width: SQUARE,
});

const makePost = (username: string, index: number): Post => {
  const shortcode = `${username.slice(0, 4)}${index.toString(BASE36).padStart(3, "0")}X`;
  const base = {
    caption: CAPTIONS[index % CAPTIONS.length] ?? "",
    comments: 12 + ((index * 131) % 900),
    likes: 1200 + ((index * 7919) % 48_000),
    owner: {
      avatar: img(`${username}-avatar`, AVATAR_SIZE, AVATAR_SIZE),
      fullName: "Demo Account",
      isVerified: true,
      username,
    },
    shortcode,
    takenAt: POSTED_AT - index * DAY_SECONDS * 2,
  };

  switch (index % 5) {
    case 1: {
      return {
        ...base,
        kind: "carousel",
        media: [0, 1, 2].map((n) =>
          image(`${shortcode}-${n}`, PORTRAIT_HEIGHT)
        ),
        thumbnail: img(`${shortcode}-0`),
        views: null,
      };
    }
    case 3: {
      const poster = img(`${shortcode}-reel`, SQUARE, STORY_HEIGHT);
      return {
        ...base,
        kind: "reel",
        media: [
          {
            height: STORY_HEIGHT,
            thumbnail: poster,
            type: "video",
            url: SAMPLE_VIDEO,
            width: SQUARE,
          },
        ],
        thumbnail: poster,
        views: 30_000 + ((index * 104_729) % 900_000),
      };
    }
    default: {
      return {
        ...base,
        kind: "image",
        media: [image(shortcode)],
        thumbnail: img(shortcode),
        views: null,
      };
    }
  }
};

const HIGHLIGHT_TITLES = ["Travel", "Studio", "Prints", "BTS", "Film"];

const makeProfile = (username: string): Profile => {
  const isPrivate = username === "private";
  const posts = isPrivate
    ? []
    : Array.from({ length: PAGE_SIZE }, (_, index) =>
        makePost(username, index)
      );
  return {
    avatar: img(`${username}-avatar`, AVATAR_SIZE, AVATAR_SIZE),
    biography:
      "Photographer & filmmaker based in Bangkok.\nPrints and bookings ↓",
    externalUrl: "https://example.com",
    followers: 128_400,
    following: 312,
    fullName: "Demo Account",
    highlights: isPrivate
      ? []
      : HIGHLIGHT_TITLES.map((title, index) => ({
          cover: img(`${username}-hl-${title}`, AVATAR_SIZE, AVATAR_SIZE),
          id: String(1000 + index),
          title,
        })),
    id: "1",
    isPrivate,
    isVerified: true,
    postCount: 842,
    posts,
    reels: posts.filter((post) => post.kind === "reel"),
    username,
  };
};

const makePostFromCode = (shortcode: string): Post => {
  const index = Number.parseInt(shortcode.slice(4, 7), BASE36);
  return {
    ...makePost("demo", Number.isNaN(index) ? 1 : index),
    shortcode,
  };
};

const storyItems = (seed: string, count: number): StoryItem[] =>
  Array.from({ length: count }, (_, index) => {
    const id = `${seed}-${index}`;
    const poster = img(id, SQUARE, STORY_HEIGHT);
    const isVideo = index === 1;
    return {
      height: STORY_HEIGHT,
      id,
      takenAt: STORY_AT - index * HOUR_SECONDS,
      thumbnail: poster,
      type: isVideo ? "video" : "image",
      url: isVideo ? SAMPLE_VIDEO : poster,
      width: SQUARE,
    };
  });

export const mockProvider: InstagramProvider = {
  getAccount: (userId) =>
    Promise.resolve({
      avatar: img(`account-${userId}`, AVATAR_SIZE, AVATAR_SIZE),
      username: "you",
    }),
  getHighlightItems: (id) => Promise.resolve(storyItems(`hl-${id}`, 4)),
  getMorePosts: (_userId, next) => {
    const page = next ? Number(next) : 1;
    const posts = Array.from({ length: PAGE_SIZE }, (_, index) =>
      makePost("demo", page * PAGE_SIZE + index)
    );
    return Promise.resolve({
      next: page < LAST_PAGE ? String(page + 1) : null,
      posts,
    });
  },
  getPost: (shortcode) => Promise.resolve(makePostFromCode(shortcode)),
  getProfile: (username) =>
    username === "notfound"
      ? Promise.reject(new InstagramError("not_found", "Profile not found"))
      : Promise.resolve(makeProfile(username)),
  getStories: (userId) => Promise.resolve(storyItems(`story-${userId}`, 3)),
};
