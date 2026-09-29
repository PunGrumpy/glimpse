import "server-only";
import { cache } from "react";

import { mockProvider } from "./providers/mock";
import { webProvider } from "./providers/web";
import { getServiceSession } from "./session";
import type { InstagramSession } from "./session";
import { InstagramError } from "./types";
import type {
  ConnectedAccount,
  InstagramProvider,
  Post,
  PostsPage,
  Profile,
  StoryItem,
} from "./types";

export { getVisitorSession, VISITOR_COOKIE } from "./session";
export type { InstagramSession } from "./session";
export { InstagramError } from "./types";
export type {
  ConnectedAccount,
  Highlight,
  InstagramErrorCode,
  MediaItem,
  Post,
  PostsPage,
  Profile,
  StoryItem,
} from "./types";

const provider: InstagramProvider =
  process.env.IG_PROVIDER === "mock" ? mockProvider : webProvider;

const MINUTE_MS = 60 * 1000;
const DEFAULT_TTL_MS = 10 * MINUTE_MS;
// Stories expire after 24h and new ones appear anytime, so keep them briefly.
const STORIES_TTL_MS = MINUTE_MS;
const MAX_ENTRIES = 500;

/**
 * Keeps successful lookups for a while so repeat visits don't spend
 * Instagram's rate limit. Failures are never cached. Only data fetched
 * logged out or with the service account goes in here: anything fetched with
 * a visitor's session may be private to them and must not reach others.
 */
const createCache = <T>(ttl = DEFAULT_TTL_MS) => {
  const store = new Map<string, { value: T; expires: number }>();
  return async (key: string, load: () => Promise<T>): Promise<T> => {
    const hit = store.get(key);
    if (hit && hit.expires > Date.now()) {
      return hit.value;
    }
    const value = await load();
    // Maps iterate in insertion order, so the first key is the oldest.
    const oldest = store.keys().next();
    if (store.size >= MAX_ENTRIES && !oldest.done) {
      store.delete(oldest.value);
    }
    store.set(key, { expires: Date.now() + ttl, value });
    return value;
  };
};

const profileCache = createCache<Profile>();
const postCache = createCache<Post>();
const pageCache = createCache<PostsPage>();
const highlightCache = createCache<StoryItem[]>();
const storyCache = createCache<StoryItem[]>(STORIES_TTL_MS);
const accountCache = createCache<ConnectedAccount>();

/** Session for stories and highlights: the visitor's own, else the service account. */
export const storySession = (
  visitor: InstagramSession | null
): InstagramSession | null => visitor ?? getServiceSession();

/** Whether stories and highlight contents can be opened for this visitor. */
export const canViewStories = (visitor: InstagramSession | null): boolean =>
  process.env.IG_PROVIDER === "mock" || storySession(visitor) !== null;

/**
 * Accounts hidden from logged-out visitors are public to any logged-in
 * account, so the service account may fetch (and cache) them.
 */
const getHiddenProfile = (
  username: string,
  visitor: InstagramSession | null
): Promise<Profile> => {
  if (visitor) {
    return provider.getProfile(username, visitor);
  }
  const service = getServiceSession();
  if (!service) {
    throw new InstagramError(
      "restricted",
      "Profile hidden from logged-out visitors"
    );
  }
  return profileCache(`service:${username}`, () =>
    provider.getProfile(username, service)
  );
};

/** A profile as a logged-out visitor sees it: private accounts show no media. */
const withoutPrivateMedia = (profile: Profile): Profile =>
  profile.isPrivate
    ? { ...profile, highlights: [], posts: [], reels: [] }
    : profile;

/**
 * Instagram throttles logged-out requests per IP, which on shared egress
 * (Cloudflare Workers) is nearly all the time. The service account is limited
 * per account instead, so it stands in for the logged-out lookup. Whatever it
 * follows stays hidden: the result is trimmed to the logged-out view.
 */
const getThrottledProfile = (username: string): Promise<Profile> => {
  const service = getServiceSession();
  if (!service) {
    throw new InstagramError(
      "rate_limited",
      "Instagram is rate limiting requests"
    );
  }
  return profileCache(username, async () =>
    withoutPrivateMedia(await provider.getProfile(username, service))
  );
};

const loadProfile = async (
  username: string,
  visitor: InstagramSession | null
): Promise<Profile> => {
  let profile: Profile;
  try {
    profile = await profileCache(username, () =>
      provider.getProfile(username, null)
    );
  } catch (error) {
    if (!(error instanceof InstagramError)) {
      throw error;
    }
    if (error.code === "restricted") {
      return getHiddenProfile(username, visitor);
    }
    if (error.code !== "rate_limited") {
      throw error;
    }
    profile = await getThrottledProfile(username);
  }
  // Private posts come back only for a session that follows the account, and
  // only the visitor's own session: never the service account's.
  if (profile.isPrivate && visitor) {
    return provider.getProfile(username, visitor);
  }
  return profile;
};

const loadPost = async (
  shortcode: string,
  visitor: InstagramSession | null
): Promise<Post> => {
  try {
    return await postCache(shortcode, () => provider.getPost(shortcode, null));
  } catch (error) {
    const missing =
      error instanceof InstagramError && error.code === "not_found";
    if (visitor && missing) {
      return provider.getPost(shortcode, visitor);
    }
    throw error;
  }
};

// react `cache` dedupes generateMetadata + page within one request.
export const getProfile = cache(loadProfile);
export const getPost = cache(loadPost);

export const getMorePosts = (
  userId: string,
  next: string | undefined,
  privateFeed: InstagramSession | null
): Promise<PostsPage> => {
  if (privateFeed) {
    return provider.getMorePosts(userId, next, privateFeed);
  }
  return pageCache(`${userId}:${next ?? ""}`, () =>
    provider.getMorePosts(userId, next, null)
  );
};

const requireStorySession = (
  visitor: InstagramSession | null
): InstagramSession => {
  const session = storySession(visitor);
  if (!session) {
    throw new InstagramError(
      "login_required",
      "Stories need an Instagram session"
    );
  }
  return session;
};

export const getHighlightItems = (
  highlightId: string,
  visitor: InstagramSession | null
): Promise<StoryItem[]> => {
  const session = requireStorySession(visitor);
  if (session.owner === "visitor") {
    return provider.getHighlightItems(highlightId, session);
  }
  return highlightCache(highlightId, () =>
    provider.getHighlightItems(highlightId, session)
  );
};

export const getStories = (
  userId: string,
  visitor: InstagramSession | null
): Promise<StoryItem[]> => {
  const session = requireStorySession(visitor);
  if (session.owner === "visitor") {
    return provider.getStories(userId, session);
  }
  return storyCache(userId, () => provider.getStories(userId, session));
};

/** Public profile info for the account behind a session, for display. */
export const getConnectedAccount = (
  session: InstagramSession
): Promise<ConnectedAccount> =>
  accountCache(session.userId, () => provider.getAccount(session.userId));
