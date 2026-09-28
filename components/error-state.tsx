import {
  CloudOffIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
  SearchXIcon,
  TimerIcon,
} from "lucide-react";
import Link from "next/link";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { InstagramErrorCode } from "@/lib/instagram";

interface Copy {
  icon: typeof LockIcon;
  title: string;
  body: string;
  /** Offer to connect the visitor's own session, which may unlock this. */
  connect?: boolean;
}

const COPY = {
  login_required: {
    body: "Stories and highlights need a logged-in Instagram session, or the one you connected has expired.",
    connect: true,
    icon: KeyRoundIcon,
    title: "Needs an Instagram session",
  },
  not_found: {
    body: "This account or post doesn't exist, or it was removed.",
    icon: SearchXIcon,
    title: "Nothing here",
  },
  private: {
    body: "Only approved followers can see its posts. If you follow it, connect your account to view them here.",
    connect: true,
    icon: LockIcon,
    title: "This account is private",
  },
  rate_limited: {
    body: "Instagram is limiting requests right now. Try again in a minute or two.",
    icon: TimerIcon,
    title: "Instagram needs a breather",
  },
  restricted: {
    body: "Instagram hides this account from people who aren't signed in. Connect your account to view it.",
    connect: true,
    icon: EyeOffIcon,
    title: "Only visible when logged in",
  },
  upstream: {
    body: "Something went wrong on Instagram's side. Try again shortly.",
    icon: CloudOffIcon,
    title: "Couldn't reach Instagram",
  },
} satisfies Record<InstagramErrorCode, Copy>;

const SECONDARY_LINK =
  "pressable inline-flex h-9 items-center rounded-[10px] border border-line-strong bg-white px-4 font-medium text-[14px] hover:bg-sand-50";
const PRIMARY_LINK =
  "btn-primary pressable inline-flex h-9 items-center rounded-[10px] px-4 font-medium text-[14px]";

export const ErrorState = ({
  code,
  retryHref,
  connected = false,
}: {
  code: InstagramErrorCode;
  retryHref?: string;
  /** Whether the visitor already connected a session (hides the offer). */
  connected?: boolean;
}) => {
  const copy: Copy = COPY[code];
  const { icon: Icon, title, body } = copy;
  const offerConnect = copy.connect === true && !connected;
  return (
    <Empty className="py-24">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle className="text-[18px]">{title}</EmptyTitle>
        <EmptyDescription>{body}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center gap-2">
        {offerConnect && (
          <Link href="/accounts/session" className={PRIMARY_LINK}>
            Connect your account
          </Link>
        )}
        {retryHref && !offerConnect && (
          <Link href={retryHref} className={PRIMARY_LINK}>
            Try again
          </Link>
        )}
        <Link href="/" className={SECONDARY_LINK}>
          Search something else
        </Link>
      </EmptyContent>
    </Empty>
  );
};
