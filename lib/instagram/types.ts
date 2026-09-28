import type { z } from "zod/mini";

import type {
  ErrorCode,
  MediaItemSchema,
  PostSchema,
  PostsPageSchema,
  StoryItemSchema,
} from "./domain";
import type { InstagramSession } from "./session";

export type MediaItem = z.infer<typeof MediaItemSchema>;
export type Post = z.infer<typeof PostSchema>;
export type StoryItem = z.infer<typeof StoryItemSchema>;
export type PostsPage = z.infer<typeof PostsPageSchema>;
export type InstagramErrorCode = z.infer<typeof ErrorCode>;

export interface Highlight {
  id: string;
  title: string;
  cover: string;
}

export interface Profile {
  id: string;
  username: string;
  fullName: string;
  biography: string;
  avatar: string;
  externalUrl: string | null;
  isPrivate: boolean;
  isVerified: boolean;
  followers: number;
  following: number;
  postCount: number;
  posts: Post[];
  reels: Post[];
  highlights: Highlight[];
}

/** The Instagram account a visitor connected, shown in the header. */
export interface ConnectedAccount {
  username: string;
  avatar: string;
}

export class InstagramError extends Error {
  readonly code: InstagramErrorCode;

  constructor(code: InstagramErrorCode, message: string) {
    super(message);
    this.name = "InstagramError";
    this.code = code;
  }
}

/**
 * Data access. `session` is `null` for logged-out requests; providers never
 * pick a session themselves, the caller decides (see lib/instagram/index.ts).
 */
export interface InstagramProvider {
  getProfile: (
    username: string,
    session: InstagramSession | null
  ) => Promise<Profile>;
  getPost: (
    shortcode: string,
    session: InstagramSession | null
  ) => Promise<Post>;
  /** Posts after the first 12 that come with the profile. */
  getMorePosts: (
    userId: string,
    next: string | undefined,
    session: InstagramSession | null
  ) => Promise<PostsPage>;
  getHighlightItems: (
    highlightId: string,
    session: InstagramSession
  ) => Promise<StoryItem[]>;
  /** A user's active (24h) stories. */
  getStories: (
    userId: string,
    session: InstagramSession
  ) => Promise<StoryItem[]>;
  getAccount: (userId: string) => Promise<ConnectedAccount>;
}
