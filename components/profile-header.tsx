import { ExternalLinkIcon } from "lucide-react";

import { ProfileAvatar } from "@/components/profile-avatar";
import { VerifiedBadge } from "@/components/verified-badge";
import { formatCount, formatExact } from "@/lib/format";
import type { Profile } from "@/lib/instagram";

const URL_PREFIX = /^https?:\/\/(?:www\.)?/u;
const TRAILING_SLASH = /\/$/u;

const displayUrl = (url: string): string =>
  url.replace(URL_PREFIX, "").replace(TRAILING_SLASH, "");

export const ProfileHeader = ({ profile }: { profile: Profile }) => {
  const stats = [
    { label: "posts", value: profile.postCount },
    { label: "followers", value: profile.followers },
    { label: "following", value: profile.following },
  ];

  return (
    <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-10 sm:text-left">
      <ProfileAvatar src={profile.avatar} username={profile.username} />
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-center justify-center gap-1.5 sm:justify-start">
          <h1 className="truncate text-[28px] leading-tight tracking-[-0.03em]">
            {profile.username}
          </h1>
          {profile.isVerified && <VerifiedBadge className="size-5" />}
        </div>
        {profile.fullName && (
          <p className="text-ink/70 mt-0.5 text-[15px] font-medium">
            {profile.fullName}
          </p>
        )}

        <dl className="mt-5 flex justify-center gap-6 sm:justify-start">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <dt className="sr-only">{stat.label}</dt>
              <dd
                className="text-[16px] font-semibold tabular-nums"
                title={formatExact(stat.value)}
              >
                {formatCount(stat.value)}
              </dd>
              <span aria-hidden="true" className="text-ink/55 text-[14px]">
                {stat.label}
              </span>
            </div>
          ))}
        </dl>

        {profile.biography && (
          <p className="text-ink/80 mt-5 max-w-xl font-serif text-[16px] leading-relaxed font-light whitespace-pre-line">
            {profile.biography}
          </p>
        )}
        {profile.externalUrl && (
          <a
            href={profile.externalUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-flare-600 mt-3 inline-flex items-center gap-1 text-[14px] font-medium hover:underline"
          >
            {displayUrl(profile.externalUrl)}
            <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </header>
  );
};
