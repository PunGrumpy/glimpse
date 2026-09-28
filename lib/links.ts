import type { Post } from "@/lib/instagram/types";

export const postHref = (post: Pick<Post, "kind" | "shortcode">): string =>
  `/${post.kind === "reel" ? "reel" : "p"}/${post.shortcode}`;
