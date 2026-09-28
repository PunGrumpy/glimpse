import "server-only";
import type { Response as UndiciResponse } from "undici";
import type { z } from "zod";

import { igFetch } from "../http";
import {
  gqlEnvelope,
  MediaInfoSchema,
  PaginationDataSchema,
  PostDataSchema,
  ReelsMediaSchema,
  TimelineDataSchema,
  UserFeedSchema,
  UserInfoDataSchema,
  WebProfileInfoSchema,
} from "../schemas";
import type {
  EdgeChild,
  EdgeNode,
  EdgeUser,
  XigMedia,
  XigMediaFields,
  XigUser,
} from "../schemas";
import type { InstagramSession } from "../session";
import { InstagramError } from "../types";
import type {
  ConnectedAccount,
  Highlight,
  InstagramProvider,
  MediaItem,
  Post,
  PostsPage,
  Profile,
  StoryItem,
} from "../types";

/**
 * Instagram via the mobile API host. `www.instagram.com` with the web app id
 * is IP-throttled almost immediately; `i.instagram.com` with the Android app
 * id is not. Doc ids are Polaris logged-out queries and rotate every few
 * months: current ones appear in a profile page served to Googlebot under
 * `expectedPreloaders[].queryID`.
 */

const API = "https://i.instagram.com";
const PROFILE_INFO_DOC = "28411565758451503";
const PROFILE_TIMELINE_DOC = "28473938932242567";
const POST_DOC = "27130156389949648";
const PROFILE_PAGINATION_DOC = "28216882607949899";
const PAGE_SIZE = 12;
const PROFILE_NOT_FOUND = "Profile not found";
const FALLBACK_SIZE = 1080;
const MEDIA_TYPE_VIDEO = 2;

const HEADERS = {
  "Accept-Language": "en-US",
  // Node's fetch always sends Sec-Fetch-Mode: cors; without this IG answers 400 "SecFetch Policy violation".
  "Sec-Fetch-Site": "same-origin",
  "User-Agent":
    "Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229237)",
  "X-IG-App-ID": "567067343352427",
};

const headersFor = (session: InstagramSession | null) =>
  session ? { ...HEADERS, Cookie: session.cookie } : HEADERS;

// ---- Shortcodes ----

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const BASE = 64n;
const SHORTCODE_LENGTH = 11;

export const shortcodeToPk = (code: string): string => {
  let n = 0n;
  for (const ch of code.slice(0, SHORTCODE_LENGTH)) {
    n = n * BASE + BigInt(ALPHABET.indexOf(ch));
  }
  return n.toString();
};

export const pkToShortcode = (pk: string): string => {
  const [id = "0"] = pk.split("_");
  let n = BigInt(id);
  let code = "";
  while (n > 0n) {
    code = ALPHABET[Number(n % BASE)] + code;
    n /= BASE;
  }
  return code;
};

// ---- Mapping: classic "edge_*" shape ----

const edgeMedia = (node: EdgeChild): MediaItem => ({
  height: node.dimensions?.height ?? FALLBACK_SIZE,
  thumbnail: node.display_url,
  type: node.is_video ? "video" : "image",
  url: (node.is_video && node.video_url) || node.display_url,
  width: node.dimensions?.width ?? FALLBACK_SIZE,
});

const edgeKind = (node: EdgeNode, isCarousel: boolean): Post["kind"] => {
  if (isCarousel) {
    return "carousel";
  }
  if (node.product_type === "clips") {
    return "reel";
  }
  return node.is_video ? "video" : "image";
};

const edgePost = (node: EdgeNode): Post => {
  const children =
    node.edge_sidecar_to_children?.edges.map((edge) => edge.node) ?? [];
  const isCarousel = children.length > 0;
  return {
    caption: node.edge_media_to_caption?.edges[0]?.node.text ?? "",
    comments: node.edge_media_to_comment?.count ?? null,
    kind: edgeKind(node, isCarousel),
    likes:
      node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? null,
    media: isCarousel ? children.map(edgeMedia) : [edgeMedia(node)],
    shortcode: node.shortcode,
    takenAt: node.taken_at_timestamp,
    thumbnail: node.thumbnail_src ?? node.display_url,
    views: node.video_view_count ?? null,
  };
};

// ---- Mapping: Polaris "xig" shape ----

const xigMedia = (media: XigMediaFields): MediaItem => {
  const [image] = media.image_versions2?.candidates ?? [];
  const [video] = media.video_versions ?? [];
  const thumbnail = image?.url ?? media.display_uri ?? "";
  return {
    height: media.original_height ?? image?.height ?? FALLBACK_SIZE,
    thumbnail,
    type: video ? "video" : "image",
    url: video?.url ?? thumbnail,
    width: media.original_width ?? image?.width ?? FALLBACK_SIZE,
  };
};

const xigKind = (media: XigMedia): Post["kind"] => {
  if (media.carousel_media?.length) {
    return "carousel";
  }
  if (media.product_type === "clips") {
    return "reel";
  }
  const isVideo =
    Boolean(media.video_versions?.length) ||
    media.media_type === MEDIA_TYPE_VIDEO;
  return isVideo ? "video" : "image";
};

const xigOwner = (media: XigMedia): Post["owner"] => {
  if (!media.user) {
    return undefined;
  }
  return {
    avatar: media.user.profile_pic_url ?? "",
    fullName: media.user.full_name ?? "",
    isVerified: media.user.is_verified ?? false,
    username: media.user.username,
  };
};

const xigPost = (media: XigMedia): Post => {
  const items = media.carousel_media?.length ? media.carousel_media : [media];
  const mapped = items.map(xigMedia);
  return {
    caption: media.caption?.text ?? "",
    comments: media.comment_count ?? null,
    kind: xigKind(media),
    likes: media.like_count ?? null,
    media: mapped,
    owner: xigOwner(media),
    shortcode: media.code ?? pkToShortcode(media.pk),
    takenAt: media.taken_at ?? 0,
    thumbnail: mapped[0]?.thumbnail ?? "",
    views: media.play_count ?? media.view_count ?? null,
  };
};

const toHighlights = (user: XigUser): Highlight[] =>
  (user.lox_highlights_connection?.edges ?? []).map(({ node }) => ({
    cover: node.cover_media_cropped_thumbnail_url ?? "",
    id: node.id.replace(/^highlight:/u, ""),
    title: node.title,
  }));

// ---- Transport ----

type GqlVariables = Record<string, string | number | boolean | null>;

const throwForStatus = (status: number): never => {
  if (status === 404) {
    throw new InstagramError("not_found", "Not found");
  }
  if (status === 401 || status === 403 || status === 429) {
    throw new InstagramError(
      "rate_limited",
      "Instagram is rate limiting requests"
    );
  }
  throw new InstagramError("upstream", `Instagram responded ${status}`);
};

const parseBody = async <T extends z.ZodType>(
  res: UndiciResponse,
  schema: T
) => {
  try {
    return schema.safeParse(await res.json());
  } catch {
    // Blocked requests get an HTML login page instead of JSON.
    throw new InstagramError("rate_limited", "Instagram returned a login wall");
  }
};

const readJson = async <T extends z.ZodType>(
  res: UndiciResponse,
  schema: T
): Promise<z.infer<T>> => {
  const parsed = await parseBody(res, schema);
  if (!parsed.success) {
    throw new InstagramError(
      "upstream",
      `Unexpected Instagram response: ${parsed.error.issues[0]?.message}`
    );
  }
  return parsed.data;
};

const gql = async <T extends z.ZodType>(
  docId: string,
  variables: GqlVariables,
  data: T
): Promise<z.infer<T>> => {
  const res = await igFetch(`${API}/api/graphql`, {
    body: new URLSearchParams({
      doc_id: docId,
      variables: JSON.stringify(variables),
    }),
    headers: {
      ...HEADERS,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  if (!res.ok) {
    throwForStatus(res.status);
  }
  const json = await readJson(res, gqlEnvelope(data));
  // Field-level errors (severity ERROR) arrive alongside usable data; only CRITICAL is fatal.
  if (json.errors?.some((error) => error.severity === "CRITICAL")) {
    throw new InstagramError(
      "rate_limited",
      json.errors[0]?.message ?? "Instagram rejected the query"
    );
  }
  if (json.data === undefined) {
    throw new InstagramError("upstream", "Instagram returned no data");
  }
  return json.data;
};

/** Logged-in private API. Expired sessions come back as 401/403 or a login_required message. */
const privateApi = async <T extends z.ZodType>(
  path: string,
  session: InstagramSession,
  schema: T
): Promise<z.infer<T>> => {
  const res = await igFetch(`${API}${path}`, { headers: headersFor(session) });
  if (res.status === 401 || res.status === 403) {
    throw new InstagramError("login_required", "Instagram session expired");
  }
  if (!res.ok) {
    throwForStatus(res.status);
  }
  return readJson(res, schema);
};

// ---- Profile ----

class ProfileFallbackError extends Error {
  constructor() {
    super("web_profile_info unavailable for this account");
    this.name = "ProfileFallbackError";
  }
}

const getUserInfo = (pk: string) =>
  gql(
    PROFILE_INFO_DOC,
    {
      id: pk,
      is_crawler: false,
      location_id: null,
      shared_entity_id: pk,
      shid: null,
      should_enable_highlights_tray: true,
      should_show_threads_badge: false,
      skip_dialog: false,
    },
    UserInfoDataSchema
  );

const timelineVariables = (userId: string) =>
  ({
    enable_blocking_post_navigation: false,
    enable_grid_prefetch: false,
    first: PAGE_SIZE,
    media_types: null,
    shid: "",
    user_id: userId,
  }) satisfies GqlVariables;

// Only the tray (titles + covers) is public; the stories inside need a login.
const getHighlights = async (pk: string): Promise<Highlight[]> => {
  try {
    const { xig_user_by_igid_v2: user } = await getUserInfo(pk);
    return user ? toHighlights(user) : [];
  } catch {
    return [];
  }
};

const edgeProfile = async (user: EdgeUser): Promise<Profile> => {
  // A private profile only has media when the session follows it.
  const media = user.edge_owner_to_timeline_media.edges;
  const hasMedia = !user.is_private || media.length > 0;
  return {
    avatar: user.profile_pic_url_hd ?? user.profile_pic_url,
    biography: user.biography,
    externalUrl: user.external_url,
    followers: user.edge_followed_by.count,
    following: user.edge_follow.count,
    fullName: user.full_name,
    highlights: hasMedia ? await getHighlights(user.id) : [],
    id: user.id,
    isPrivate: user.is_private,
    isVerified: user.is_verified,
    postCount: user.edge_owner_to_timeline_media.count,
    posts: media.map((edge) => edgePost(edge.node)),
    reels: (user.edge_felix_video_timeline?.edges ?? []).map((edge) => ({
      ...edgePost(edge.node),
      kind: "reel" as const,
    })),
    username: user.username,
  };
};

const getProfileRest = async (
  username: string,
  session: InstagramSession | null
): Promise<Profile> => {
  const res = await igFetch(
    `${API}/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    { headers: headersFor(session) }
  );
  // Some business accounts 400 with "Asset ... ig_business_category_subvertical has been deleted".
  if (res.status === 400) {
    throw new ProfileFallbackError();
  }
  if (!res.ok) {
    throwForStatus(res.status);
  }
  const { data } = await readJson(res, WebProfileInfoSchema);
  if (!data) {
    throw new InstagramError(
      "restricted",
      "Profile hidden from logged-out visitors"
    );
  }
  if (!data.user) {
    throw new InstagramError("not_found", PROFILE_NOT_FOUND);
  }
  return edgeProfile(data.user);
};

// og:description reads like "269M Followers, 195 Following, 32K Posts - ..."
const OG_DESCRIPTION =
  /<meta property="og:description" content="(?<content>[^"]*)"/u;
const POSTS_SUFFIX = " Posts";
const UNIT_SCALE = new Map([
  ["K", 1e3],
  ["M", 1e6],
  ["B", 1e9],
]);

const parseCount = (text: string): number | null => {
  const unit = text.at(-1) ?? "";
  const scale = UNIT_SCALE.get(unit);
  const digits = (scale ? text.slice(0, -1) : text).replaceAll(",", "");
  const count = Number(digits);
  if (!digits || Number.isNaN(count)) {
    return null;
  }
  return Math.round(count * (scale ?? 1));
};

const parseOgPostCount = (html: string): number | null => {
  const content = OG_DESCRIPTION.exec(html)?.groups?.content ?? "";
  const [summary = ""] = content.split(" - ");
  const posts = summary.split(", ").find((part) => part.endsWith(POSTS_SUFFIX));
  return posts ? parseCount(posts.slice(0, -POSTS_SUFFIX.length)) : null;
};

const USER_ID = /"user_id":"(?<pk>\d+)"/u;

/**
 * Why we are on the GraphQL path. The crawler page looks the same for hidden
 * and nonexistent accounts, so a missing pk only means "not found" when REST
 * already confirmed the account exists (the 400 business-account bug).
 */
type FallbackReason = "rest-unavailable" | "throttled";

// The pk isn't exposed without login except in the page served to crawlers.
const findProfilePk = async (
  username: string,
  reason: FallbackReason
): Promise<{ pk: string; postCount: number | null }> => {
  const res = await igFetch(
    `https://www.instagram.com/${encodeURIComponent(username)}/`,
    {
      headers: {
        "Sec-Fetch-Site": "none",
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    }
  );
  if (!res.ok) {
    throwForStatus(res.status);
  }
  const html = await res.text();
  const pk = USER_ID.exec(html)?.groups?.pk;
  if (!pk && reason === "throttled") {
    throw new InstagramError(
      "rate_limited",
      "Can't tell hidden from missing accounts while throttled"
    );
  }
  if (!pk) {
    throw new InstagramError("not_found", PROFILE_NOT_FOUND);
  }
  return { pk, postCount: parseOgPostCount(html) };
};

const getProfileGraphql = async (
  username: string,
  reason: FallbackReason
): Promise<Profile> => {
  const { pk, postCount } = await findProfilePk(username, reason);
  const { xig_user_by_igid_v2: user } = await getUserInfo(pk);
  if (!user) {
    throw new InstagramError("not_found", PROFILE_NOT_FOUND);
  }

  let posts: Post[] = [];
  if (!user.is_private) {
    const timeline = await gql(
      PROFILE_TIMELINE_DOC,
      timelineVariables(pk),
      TimelineDataSchema
    );
    const edges =
      timeline.xig_user_by_igid_v2?.polaris_timeline_connection.edges ?? [];
    posts = edges.map((edge) => xigPost(edge.node));
  }

  return {
    avatar: user.hd_profile_pic_url_info?.url ?? user.profile_pic_url,
    biography: user.biography ?? "",
    externalUrl: user.external_url ?? null,
    followers: user.follower_count,
    following: user.following_count,
    fullName: user.full_name,
    highlights: user.is_private ? [] : toHighlights(user),
    id: user.pk,
    isPrivate: user.is_private,
    isVerified: user.is_verified,
    postCount: user.media_count ?? postCount ?? posts.length,
    posts,
    reels: posts.filter((post) => post.kind === "reel"),
    username: user.username,
  };
};

// After the REST endpoint throttles us, skip it for a while instead of hammering it.
const REST_COOLDOWN_MS = 5 * 60 * 1000;
let restBlockedUntil = 0;

/** Whether a logged-out REST failure should retry via GraphQL; starts the cooldown when throttled. */
const shouldFallBack = (
  error: InstagramError | ProfileFallbackError
): boolean => {
  if (error instanceof ProfileFallbackError) {
    return true;
  }
  const throttled = error.code === "rate_limited";
  if (throttled) {
    restBlockedUntil = Date.now() + REST_COOLDOWN_MS;
  }
  return throttled;
};

const getProfile = async (
  username: string,
  session: InstagramSession | null
): Promise<Profile> => {
  // Logged-in requests always need REST: the GraphQL fallback is logged-out only.
  if (!session && Date.now() < restBlockedUntil) {
    return getProfileGraphql(username, "throttled");
  }
  try {
    return await getProfileRest(username, session);
  } catch (error) {
    const known =
      error instanceof InstagramError || error instanceof ProfileFallbackError;
    if (!session && known && shouldFallBack(error)) {
      const reason =
        error instanceof ProfileFallbackError
          ? "rest-unavailable"
          : "throttled";
      return getProfileGraphql(username, reason);
    }
    throw error;
  }
};

// ---- Paging ----

// Page tokens carry what the next request needs: "g.<node id>.<cursor>" for
// the logged-out GraphQL feed, "f.<max id>" for the logged-in private feed.
const GRAPHQL_TOKEN = /^g\.(?<nodeId>\d+)\.(?<cursor>.+)$/u;
const FEED_TOKEN = /^f\.(?<maxId>.+)$/u;

const graphqlPage = async (
  nodeId: string,
  cursor: string
): Promise<PostsPage> => {
  const page = await gql(
    PROFILE_PAGINATION_DOC,
    {
      after: cursor,
      enable_blocking_post_navigation: false,
      first: PAGE_SIZE,
      id: nodeId,
      media_types: null,
    },
    PaginationDataSchema
  );
  const connection = page.node?.polaris_timeline_connection;
  if (!connection) {
    return { next: null, posts: [] };
  }
  const { end_cursor: endCursor, has_next_page: hasNext } =
    connection.page_info;
  return {
    next: hasNext && endCursor ? `g.${nodeId}.${endCursor}` : null,
    posts: connection.edges.map((edge) => xigPost(edge.node)),
  };
};

// The first page duplicates the posts the profile already has; it only gives
// us the node id and cursor to continue from.
const firstGraphqlPage = async (userId: string): Promise<PostsPage> => {
  const first = await gql(
    PROFILE_TIMELINE_DOC,
    timelineVariables(userId),
    TimelineDataSchema
  );
  const user = first.xig_user_by_igid_v2;
  if (!user) {
    throw new InstagramError("not_found", PROFILE_NOT_FOUND);
  }
  const info = user.polaris_timeline_connection.page_info;
  if (!info.has_next_page || !info.end_cursor) {
    return { next: null, posts: [] };
  }
  return graphqlPage(user.id, info.end_cursor);
};

const feedPage = async (
  userId: string,
  maxId: string | undefined,
  session: InstagramSession
): Promise<PostsPage> => {
  const query = new URLSearchParams({ count: String(PAGE_SIZE) });
  if (maxId) {
    query.set("max_id", maxId);
  }
  const feed = await privateApi(
    `/api/v1/feed/user/${userId}/?${query}`,
    session,
    UserFeedSchema
  );
  const next =
    feed.more_available && feed.next_max_id ? `f.${feed.next_max_id}` : null;
  return { next, posts: feed.items.map(xigPost) };
};

const getMorePosts = (
  userId: string,
  next: string | undefined,
  session: InstagramSession | null
): Promise<PostsPage> => {
  if (session) {
    return feedPage(
      userId,
      FEED_TOKEN.exec(next ?? "")?.groups?.maxId,
      session
    );
  }
  if (!next) {
    return firstGraphqlPage(userId);
  }
  const token = GRAPHQL_TOKEN.exec(next)?.groups;
  if (!token?.nodeId || !token.cursor) {
    throw new InstagramError("upstream", "Malformed page token");
  }
  return graphqlPage(token.nodeId, token.cursor);
};

// ---- Post ----

const getPost = async (
  shortcode: string,
  session: InstagramSession | null
): Promise<Post> => {
  const pk = shortcodeToPk(shortcode);
  if (session) {
    // Logged-in media info also covers posts from private accounts the session follows.
    const info = await privateApi(
      `/api/v1/media/${pk}/info/`,
      session,
      MediaInfoSchema
    );
    const [media] = info.items;
    if (!media) {
      throw new InstagramError("not_found", "Post not found");
    }
    return xigPost(media);
  }
  const data = await gql(POST_DOC, { media_id: pk }, PostDataSchema);
  const media = data.xig_polaris_media?.if_not_gated_logged_out;
  if (!media) {
    throw new InstagramError("not_found", "Post not found or private");
  }
  return xigPost(media);
};

// ---- Stories & highlight contents (logged-in only) ----

const getReelItems = async (
  reelId: string,
  session: InstagramSession
): Promise<StoryItem[]> => {
  const json = await privateApi(
    `/api/v1/feed/reels_media/?reel_ids=${encodeURIComponent(reelId)}`,
    session,
    ReelsMediaSchema
  );
  if (json.message === "login_required") {
    throw new InstagramError("login_required", "Instagram session expired");
  }
  return (json.reels?.[reelId]?.items ?? []).map((item) => ({
    ...xigMedia(item),
    id: item.id ?? item.pk,
    takenAt: item.taken_at ?? 0,
  }));
};

const getAccount = async (userId: string): Promise<ConnectedAccount> => {
  const { xig_user_by_igid_v2: user } = await getUserInfo(userId);
  if (!user) {
    throw new InstagramError("not_found", "Account not found");
  }
  return { avatar: user.profile_pic_url, username: user.username };
};

export const webProvider: InstagramProvider = {
  getAccount,
  getHighlightItems: (highlightId, session) =>
    getReelItems(`highlight:${highlightId}`, session),
  getMorePosts,
  getPost,
  getProfile,
  getStories: getReelItems,
};
