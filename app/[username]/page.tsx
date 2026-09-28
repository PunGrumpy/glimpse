import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ErrorState } from "@/components/error-state";
import { HighlightsTray } from "@/components/highlights-tray";
import { PostFeed } from "@/components/post-feed";
import { PostGrid } from "@/components/post-grid";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileTabs } from "@/components/profile-tabs";
import { StoryRoot } from "@/components/story-root";
import type { StoryReel } from "@/components/story-viewer";
import {
  canViewStories,
  getProfile,
  getStories,
  InstagramError,
} from "@/lib/instagram";
import type {
  InstagramErrorCode,
  InstagramSession,
  Profile,
  StoryItem,
} from "@/lib/instagram";
import { isValidUsername } from "@/lib/instagram/parse-input";
import { getVisitor } from "@/lib/viewer";

type Props = PageProps<"/[username]">;

type LoadResult =
  | { ok: true; username: string; profile: Profile }
  | { ok: false; username: string; error: InstagramErrorCode };

const DESCRIPTION_LENGTH = 160;

const load = async (
  params: Props["params"],
  visitor: InstagramSession | null
): Promise<LoadResult> => {
  const { username } = await params;
  if (!isValidUsername(username)) {
    notFound();
  }
  try {
    const profile = await getProfile(username.toLowerCase(), visitor);
    return { ok: true, profile, username };
  } catch (error) {
    if (!(error instanceof InstagramError)) {
      throw error;
    }
    if (error.code === "not_found") {
      notFound();
    }
    return { error: error.code, ok: false, username };
  }
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const result = await load(params, await getVisitor());
  if (!result.ok) {
    return { title: `@${result.username}` };
  }
  const { profile } = result;
  return {
    description:
      profile.biography.slice(0, DESCRIPTION_LENGTH) ||
      `View @${profile.username}'s Instagram without an account.`,
    title: `${profile.fullName || profile.username} (@${profile.username})`,
  };
};

// Stories are a bonus: a failure here shouldn't break the profile.
const loadStories = async (
  profile: Profile,
  visitor: InstagramSession | null
): Promise<StoryItem[]> => {
  if (!canViewStories(visitor) || profile.posts.length === 0) {
    return [];
  }
  try {
    return await getStories(profile.id, visitor);
  } catch {
    return [];
  }
};

const buildReels = (profile: Profile, stories: StoryItem[]): StoryReel[] => {
  const highlights = profile.highlights.map((highlight): StoryReel => ({
    cover: highlight.cover,
    key: `highlight:${highlight.id}`,
    kind: "remote",
    source: { id: highlight.id, type: "highlight" },
    title: highlight.title,
  }));
  if (stories.length === 0) {
    return highlights;
  }
  const story: StoryReel = {
    cover: profile.avatar,
    items: stories,
    key: "stories",
    kind: "loaded",
    title: "Story",
  };
  return [story, ...highlights];
};

const ProfilePosts = ({
  profile,
  visitor,
}: {
  profile: Profile;
  visitor: InstagramSession | null;
}) => {
  if (profile.isPrivate && profile.posts.length === 0) {
    return <ErrorState code="private" connected={visitor !== null} />;
  }
  if (profile.posts.length === 0) {
    return <p className="text-ink/55 py-20 text-center">No posts yet.</p>;
  }
  return (
    <ProfileTabs
      reelCount={profile.reels.length}
      posts={
        <PostFeed
          initial={profile.posts}
          userId={profile.id}
          hasMore={profile.postCount > profile.posts.length}
          privateFeed={profile.isPrivate}
        />
      }
      reels={<PostGrid posts={profile.reels} aspect="portrait" />}
    />
  );
};

const ProfilePage = async ({ params }: Props) => {
  const visitor = await getVisitor();
  const result = await load(params, visitor);
  if (!result.ok) {
    return (
      <ErrorState
        code={result.error}
        retryHref={`/${result.username}`}
        connected={visitor !== null}
      />
    );
  }
  const { profile } = result;
  const stories = await loadStories(profile, visitor);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <StoryRoot
        reels={buildReels(profile, stories)}
        hasStories={stories.length > 0}
        interactive={canViewStories(visitor)}
        owner={{ avatar: profile.avatar, username: profile.username }}
      >
        <ProfileHeader profile={profile} />
        {profile.highlights.length > 0 && (
          <div className="mt-10">
            <HighlightsTray />
          </div>
        )}
      </StoryRoot>
      <div className="border-line/70 mt-12 border-t pt-6">
        <ProfilePosts profile={profile} visitor={visitor} />
      </div>
    </div>
  );
};

export default ProfilePage;
