import { HeartIcon, MessageCircleIcon, PlayIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ErrorState } from "@/components/error-state";
import { MediaViewer } from "@/components/media-viewer";
import { VerifiedBadge } from "@/components/verified-badge";
import { formatCount, formatDate, formatExact } from "@/lib/format";
import { getPost, InstagramError } from "@/lib/instagram";
import type {
  InstagramErrorCode,
  InstagramSession,
  Post,
} from "@/lib/instagram";
import { isValidShortcode } from "@/lib/instagram/parse-input";
import { postHref } from "@/lib/links";
import { getVisitor } from "@/lib/viewer";

type Props = PageProps<"/p/[shortcode]">;

type LoadResult =
  | { ok: true; shortcode: string; post: Post }
  | { ok: false; shortcode: string; error: InstagramErrorCode };

const DESCRIPTION_LENGTH = 160;
const AVATAR_SIZE = 44;
const MS_PER_SECOND = 1000;

const load = async (
  params: Props["params"],
  visitor: InstagramSession | null
): Promise<LoadResult> => {
  const { shortcode } = await params;
  if (!isValidShortcode(shortcode)) {
    notFound();
  }
  try {
    return { ok: true, post: await getPost(shortcode, visitor), shortcode };
  } catch (error) {
    if (!(error instanceof InstagramError)) {
      throw error;
    }
    if (error.code === "not_found") {
      notFound();
    }
    return { error: error.code, ok: false, shortcode };
  }
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const result = await load(params, await getVisitor());
  if (!result.ok) {
    return { title: "Post" };
  }
  const { post } = result;
  const who = post.owner ? `@${post.owner.username}` : "Instagram";
  return {
    description: post.caption.slice(0, DESCRIPTION_LENGTH),
    title: `${post.kind === "reel" ? "Reel" : "Post"} by ${who}`,
  };
};

const OwnerLink = ({ owner }: { owner: NonNullable<Post["owner"]> }) => (
  <Link
    href={`/${owner.username}`}
    className="hover:bg-sand-100 -m-2 flex items-center gap-3 rounded-xl p-2"
  >
    <Image
      src={owner.avatar}
      alt=""
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      className="img-outline bg-sand-100 size-11 rounded-full object-cover"
    />
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[15px] font-semibold">
        <span className="truncate">{owner.username}</span>
        {owner.isVerified && <VerifiedBadge />}
      </p>
      {owner.fullName && (
        <p className="text-ink/55 truncate text-[13px]">{owner.fullName}</p>
      )}
    </div>
  </Link>
);

const PostStats = ({ post }: { post: Post }) => {
  // flatMap narrows away the nulls without a cast.
  const stats = [
    { icon: HeartIcon, label: "likes", value: post.likes },
    { icon: MessageCircleIcon, label: "comments", value: post.comments },
    { icon: PlayIcon, label: "views", value: post.views },
  ].flatMap(({ value, ...rest }) =>
    value === null ? [] : [{ ...rest, value }]
  );
  if (stats.length === 0) {
    return null;
  }
  return (
    <dl className="grid grid-cols-3 gap-2">
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="border-line/70 rounded-xl border bg-white px-3 py-2.5"
        >
          <dt className="text-ink/55 flex items-center gap-1.5 text-[12px]">
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </dt>
          <dd
            className="mt-0.5 text-[16px] font-semibold tabular-nums"
            title={formatExact(value)}
          >
            {formatCount(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const PostPage = async ({ params }: Props) => {
  const visitor = await getVisitor();
  const result = await load(params, visitor);
  if (!result.ok) {
    return (
      <ErrorState
        code={result.error}
        retryHref={`/p/${result.shortcode}`}
        connected={visitor !== null}
      />
    );
  }
  const { post } = result;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-14">
      <MediaViewer media={post.media} shortcode={post.shortcode} />

      <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        {post.owner && <OwnerLink owner={post.owner} />}
        <PostStats post={post} />

        {post.caption && (
          <p className="text-ink/85 font-serif text-[16px] leading-relaxed font-light break-words whitespace-pre-line">
            {post.caption}
          </p>
        )}

        <div className="border-line/70 text-ink/55 flex items-center justify-between border-t pt-4 text-[13px]">
          <time dateTime={new Date(post.takenAt * MS_PER_SECOND).toISOString()}>
            {formatDate(post.takenAt)}
          </time>
          <a
            href={`https://www.instagram.com${postHref(post)}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink font-medium"
          >
            Open on Instagram ↗
          </a>
        </div>
      </aside>
    </div>
  );
};

export default PostPage;
