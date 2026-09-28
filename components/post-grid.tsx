import {
  CopyIcon,
  FilmIcon,
  HeartIcon,
  MessageCircleIcon,
  PlayIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatCount } from "@/lib/format";
import type { Post } from "@/lib/instagram";
import { postHref } from "@/lib/links";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  carousel: CopyIcon,
  image: null,
  reel: FilmIcon,
  video: PlayIcon,
} as const;

const ALT_LENGTH = 120;
// Three columns, capped by the 4xl profile container.
const TILE_SIZES = "(min-width: 896px) 290px, 33vw";

const Stat = ({
  icon: Icon,
  value,
}: {
  icon: typeof HeartIcon;
  value: number;
}) => (
  <span className="flex items-center gap-1.5 tabular-nums">
    <Icon className="size-4 fill-white" aria-hidden="true" />
    {formatCount(value)}
  </span>
);

/** Views for videos, likes otherwise; whichever Instagram gave us. */
const PrimaryStat = ({ post }: { post: Post }) => {
  if (post.views !== null) {
    return <Stat icon={PlayIcon} value={post.views} />;
  }
  if (post.likes !== null) {
    return <Stat icon={HeartIcon} value={post.likes} />;
  }
  return null;
};

export const PostGrid = ({
  posts,
  aspect = "square",
}: {
  posts: Post[];
  aspect?: "square" | "portrait";
}) => (
  <ul className="grid grid-cols-3 gap-1 sm:gap-2">
    {posts.map((post) => {
      const Icon = KIND_ICON[post.kind];
      return (
        <li key={post.shortcode}>
          <Link
            href={postHref(post)}
            className={cn(
              "group bg-sand-100 focus-visible:ring-flare relative block overflow-hidden rounded-md outline-none focus-visible:ring-2 sm:rounded-xl",
              aspect === "portrait" ? "aspect-[9/16]" : "aspect-square"
            )}
          >
            <Image
              src={post.thumbnail}
              alt={post.caption.slice(0, ALT_LENGTH) || "Instagram post"}
              fill
              sizes={TILE_SIZES}
              className="img-outline rounded-[inherit] object-cover"
            />
            {Icon && (
              <Icon
                className="absolute top-2 right-2 size-4 text-white drop-shadow-[0_1px_2px_rgb(0_0_0/0.5)]"
                aria-hidden="true"
              />
            )}
            <div className="bg-ink/40 absolute inset-0 flex items-center justify-center gap-4 text-[14px] font-semibold text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
              <PrimaryStat post={post} />
              {post.comments !== null && (
                <Stat icon={MessageCircleIcon} value={post.comments} />
              )}
            </div>
          </Link>
        </li>
      );
    })}
  </ul>
);
