"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PostGrid } from "@/components/post-grid";
import { Spinner } from "@/components/ui/spinner";
import { fetchJson } from "@/lib/api-client";
import { PostsResponse } from "@/lib/instagram/domain";
import type { Post, PostsPage } from "@/lib/instagram/types";

type Status = "idle" | "loading" | "error" | "done";

const INITIAL_PAGE_SIZE = 12;
// Start fetching well before the end of the grid scrolls into view.
const PREFETCH_MARGIN = "600px 0px";

/** Next page of posts, or `null` if it couldn't be loaded. */
const fetchPage = async (
  userId: string,
  next: string | undefined,
  privateFeed: boolean
): Promise<PostsPage | null> => {
  const params = new URLSearchParams({ user: userId });
  if (next) {
    params.set("next", next);
  }
  if (privateFeed) {
    params.set("feed", "private");
  }
  try {
    const page = await fetchJson(`/api/posts?${params}`, PostsResponse);
    return page.ok ? page : null;
  } catch {
    return null;
  }
};

export const PostFeed = ({
  initial,
  userId,
  hasMore,
  privateFeed,
}: {
  initial: Post[];
  userId: string;
  hasMore: boolean;
  /** Page through the visitor's own session (private profiles). */
  privateFeed: boolean;
}) => {
  const [posts, setPosts] = useState(initial);
  const [next, setNext] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>(hasMore ? "idle" : "done");
  const sentinel = useRef<HTMLDivElement>(null);
  const loading = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading.current) {
      return;
    }
    loading.current = true;
    setStatus("loading");
    const page = await fetchPage(userId, next, privateFeed);
    loading.current = false;
    if (!page) {
      setStatus("error");
      return;
    }
    setPosts((previous) => {
      const seen = new Set(previous.map((post) => post.shortcode));
      const fresh = page.posts.filter((post) => !seen.has(post.shortcode));
      return [...previous, ...fresh];
    });
    setNext(page.next ?? undefined);
    setStatus(page.next ? "idle" : "done");
  }, [next, privateFeed, userId]);

  useEffect(() => {
    const element = sentinel.current;
    if (!element || status !== "idle") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: PREFETCH_MARGIN }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [status, loadMore]);

  return (
    <div>
      <PostGrid posts={posts} />
      <div
        ref={sentinel}
        className="flex min-h-20 items-center justify-center pt-8"
      >
        {status === "loading" && (
          <Spinner className="text-ink size-5 opacity-50" />
        )}
        {status === "error" && (
          <button
            type="button"
            onClick={loadMore}
            className="pressable border-line hover:bg-sand-100 inline-flex h-9 items-center rounded-[10px] border bg-white px-4 text-[14px] font-medium"
          >
            Couldn&apos;t load more. Try again
          </button>
        )}
        {status === "done" && posts.length > INITIAL_PAGE_SIZE && (
          <p className="text-ink/45 text-[13px]">
            You&apos;ve reached the first post.
          </p>
        )}
      </div>
    </div>
  );
};
