import { z } from "zod/mini";

/**
 * Domain shapes shared by the server and the browser. The browser validates
 * our own API responses against these, so they use the small `zod/mini` build.
 */

export const ErrorCode = z.enum([
  "not_found",
  "private",
  "restricted",
  "login_required",
  "rate_limited",
  "upstream",
]);

export const MediaItemSchema = z.object({
  height: z.number(),
  thumbnail: z.string(),
  type: z.enum(["image", "video"]),
  url: z.string(),
  width: z.number(),
});

export const OwnerSchema = z.object({
  avatar: z.string(),
  fullName: z.string(),
  isVerified: z.boolean(),
  username: z.string(),
});

export const PostSchema = z.object({
  caption: z.string(),
  comments: z.nullable(z.number()),
  kind: z.enum(["image", "video", "carousel", "reel"]),
  likes: z.nullable(z.number()),
  media: z.array(MediaItemSchema),
  owner: z.optional(OwnerSchema),
  shortcode: z.string(),
  takenAt: z.number(),
  thumbnail: z.string(),
  views: z.nullable(z.number()),
});

export const StoryItemSchema = z.extend(MediaItemSchema, {
  id: z.string(),
  takenAt: z.number(),
});

export const PostsPageSchema = z.object({
  /** Opaque token for the next page, null when there are no more posts. */
  next: z.nullable(z.string()),
  posts: z.array(PostSchema),
});

const Failure = z.object({
  error: z.union([ErrorCode, z.literal("bad_request")]),
  ok: z.literal(false),
});

/** GET /api/posts */
export const PostsResponse = z.discriminatedUnion("ok", [
  z.extend(PostsPageSchema, { ok: z.literal(true) }),
  Failure,
]);

/** GET /api/stories */
export const StoriesResponse = z.discriminatedUnion("ok", [
  z.object({ items: z.array(StoryItemSchema), ok: z.literal(true) }),
  Failure,
]);
