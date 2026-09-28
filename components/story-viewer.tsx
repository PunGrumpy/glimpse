"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { fetchJson } from "@/lib/api-client";
import { StoriesResponse } from "@/lib/instagram/domain";
import type { InstagramErrorCode, StoryItem } from "@/lib/instagram/types";
import { mediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";

export type StoryReel = {
  key: string;
  title: string;
  cover: string;
} & (
  | { kind: "loaded"; items: StoryItem[] }
  | { kind: "remote"; source: { type: "highlight" | "user"; id: string } }
);

type ReelError = InstagramErrorCode | "bad_request";

type ReelState =
  | { status: "loading" }
  | { status: "ready"; items: StoryItem[] }
  | { status: "error"; error: ReelError };

type RemoteSource = Extract<StoryReel, { kind: "remote" }>["source"];

const IMAGE_DURATION_MS = 5000;
const OWNER_AVATAR_SIZE = 32;
const STAGE_SIZES = "(min-width: 640px) 480px, 100vw";

/** Loads a remote reel, or `null` when the request was cancelled. */
const loadReel = async (
  source: RemoteSource,
  signal: AbortSignal
): Promise<ReelState | null> => {
  try {
    const body = await fetchJson(
      `/api/stories?kind=${source.type}&id=${source.id}`,
      StoriesResponse,
      signal
    );
    return body.ok
      ? { items: body.items, status: "ready" }
      : { error: body.error, status: "error" };
  } catch {
    return signal.aborted ? null : { error: "upstream", status: "error" };
  }
};

/** Items for the current reel: inline ones immediately, remote ones fetched once and kept. */
const useReelItems = (
  reel: StoryReel | undefined,
  open: boolean
): ReelState => {
  const [remote, setRemote] = useState<Record<string, ReelState>>({});

  useEffect(() => {
    if (!open || !reel || reel.kind !== "remote" || remote[reel.key]) {
      return;
    }
    const controller = new AbortController();
    const { key, source } = reel;
    const run = async () => {
      const state = await loadReel(source, controller.signal);
      if (state) {
        setRemote((previous) => ({ ...previous, [key]: state }));
      }
    };
    run();
    return () => controller.abort();
  }, [open, reel, remote]);

  if (!reel) {
    return { status: "loading" };
  }
  if (reel.kind === "loaded") {
    return { items: reel.items, status: "ready" };
  }
  return remote[reel.key] ?? { status: "loading" };
};

/** Position within the reels; advancing past the last item closes the viewer. */
const useStoryNavigation = (
  reelCount: number,
  startIndex: number | null,
  onClose: () => void
) => {
  const [reelIndex, setReelIndex] = useState(startIndex ?? 0);
  const [itemIndex, setItemIndex] = useState(0);

  /** `itemCount` is the current reel's length, unknown while it is still loading. */
  const next = (itemCount: number | undefined) => {
    if (itemCount !== undefined && itemIndex < itemCount - 1) {
      setItemIndex((index) => index + 1);
    } else if (reelIndex < reelCount - 1) {
      setReelIndex((index) => index + 1);
      setItemIndex(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (itemIndex > 0) {
      setItemIndex((index) => index - 1);
    } else if (reelIndex > 0) {
      setReelIndex((index) => index - 1);
      setItemIndex(0);
    }
  };

  return {
    atStart: reelIndex === 0 && itemIndex === 0,
    itemIndex,
    next,
    prev,
    reelIndex,
  };
};

const NavButton = ({
  side,
  onClick,
  disabled,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) => {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous" : "Next"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "pressable text-ink absolute z-10 hidden size-9 place-items-center rounded-full bg-white/90 disabled:opacity-0 sm:grid",
        side === "left"
          ? "left-[max(1rem,calc(50%-19rem))]"
          : "right-[max(1rem,calc(50%-19rem))]"
      )}
    >
      <Icon className="size-5" />
    </button>
  );
};

const segmentStyle = (
  durationMs: number | null,
  videoRatio: number,
  paused: boolean
): React.CSSProperties => {
  if (durationMs === null) {
    return { transform: `scaleX(${videoRatio})` };
  }
  return {
    animation: `story-progress ${durationMs}ms linear forwards`,
    animationPlayState: paused ? "paused" : "running",
  };
};

/**
 * Segmented progress. The active segment fills with a CSS animation for
 * images; for videos it mirrors the playback ratio.
 */
const StoryProgress = ({
  count,
  active,
  durationMs,
  videoRatio,
  paused,
  onDone,
}: {
  count: number;
  active: number;
  durationMs: number | null;
  videoRatio: number;
  paused: boolean;
  onDone: () => void;
}) => (
  <div className="flex gap-1">
    {Array.from({ length: count }, (_, segment) => (
      <div
        key={`segment-${segment}`}
        className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/35"
      >
        <div
          className={cn(
            "h-full origin-left bg-white",
            segment < active && "scale-x-100",
            segment > active && "scale-x-0"
          )}
          style={
            segment === active
              ? segmentStyle(durationMs, videoRatio, paused)
              : undefined
          }
          onAnimationEnd={segment === active ? onDone : undefined}
        />
      </div>
    ))}
  </div>
);

const StoryVideo = ({
  item,
  paused,
  onEnded,
  onProgress,
}: {
  item: StoryItem;
  paused: boolean;
  onEnded: () => void;
  onProgress: (ratio: number) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Opening a story is a click, so sound is normally allowed; if the browser
  // still refuses, fall back to muted playback instead of a frozen frame.
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (paused) {
      video.pause();
      return;
    }
    // The story can change or close while play() is pending.
    let active = true;
    const play = async () => {
      try {
        await video.play();
        return;
      } catch {
        video.muted = true;
      }
      if (!active) {
        return;
      }
      setMuted(true);
      try {
        await video.play();
      } catch {
        // Still blocked: leave the poster up; tapping the stage retries.
      }
    };
    play();
    return () => {
      active = false;
    };
  }, [paused]);

  return (
    <>
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- Instagram provides no caption tracks for stories. */}
      <video
        ref={videoRef}
        src={mediaSrc(item.url)}
        poster={mediaSrc(item.thumbnail)}
        muted={muted}
        playsInline
        onEnded={onEnded}
        onTimeUpdate={(event) => {
          const { currentTime, duration } = event.currentTarget;
          if (duration) {
            onProgress(currentTime / duration);
          }
        }}
        className="size-full object-contain"
      />
      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-3 bottom-4 z-10 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
      >
        {muted ? (
          <VolumeXIcon className="size-4" />
        ) : (
          <Volume2Icon className="size-4" />
        )}
      </button>
    </>
  );
};

const StoryError = ({ code }: { code: ReelError }) => {
  if (code === "login_required") {
    return (
      <p className="max-w-64">
        Stories need a logged-in Instagram session.{" "}
        <Link href="/accounts/session" className="text-white underline">
          Connect your account
        </Link>{" "}
        to watch them.
      </p>
    );
  }
  if (code === "rate_limited") {
    return <p>Instagram is rate limiting. Try again shortly.</p>;
  }
  return <p>Couldn&apos;t load these stories.</p>;
};

const StoryPlaceholder = ({ state }: { state: ReelState }) => {
  let content: React.ReactNode = <Spinner className="size-6 text-white" />;
  if (state.status === "error") {
    content = <StoryError code={state.error} />;
  } else if (state.status === "ready") {
    content = "This highlight is empty.";
  }
  return (
    <div className="grid size-full place-items-center text-center text-[14px] text-white/70">
      {content}
    </div>
  );
};

export const StoryViewer = ({
  reels,
  startIndex,
  owner,
  onClose,
}: {
  reels: StoryReel[];
  startIndex: number | null;
  owner: { username: string; avatar: string };
  onClose: () => void;
}) => {
  // Remounted (via key) each time it opens, so initial state comes from props.
  const open = startIndex !== null;
  const [paused, setPaused] = useState(false);
  // Playback ratio of the current video, keyed by item so it resets on change.
  const [videoProgress, setVideoProgress] = useState<{
    id: string;
    ratio: number;
  } | null>(null);
  const navigation = useStoryNavigation(reels.length, startIndex, onClose);
  const { reelIndex, itemIndex, prev } = navigation;

  const reel = reels[reelIndex];
  const state = useReelItems(reel, open);
  const items = state.status === "ready" ? state.items : undefined;
  const item = items?.[itemIndex];
  const advance = () => navigation.next(items?.length);
  const videoRatio =
    item && videoProgress?.id === item.id ? videoProgress.ratio : 0;

  // Keyboard navigation is instant: no transitions on these.
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      advance();
    } else if (event.key === "ArrowLeft") {
      prev();
    } else if (event.key === " ") {
      event.preventDefault();
      setPaused((value) => !value);
    }
  });
  useEffect(() => {
    if (!open) {
      return;
    }
    // Capture phase: the dialog's own key handling would otherwise swallow arrows.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  const holdHandlers = {
    onPointerDown: () => setPaused(true),
    onPointerLeave: () => setPaused(false),
    onPointerUp: () => setPaused(false),
  };

  let stage: React.ReactNode = <StoryPlaceholder state={state} />;
  if (item?.type === "video") {
    stage = (
      <StoryVideo
        key={item.id}
        item={item}
        paused={paused}
        onEnded={advance}
        onProgress={(ratio) => setVideoProgress({ id: item.id, ratio })}
      />
    );
  } else if (item) {
    stage = (
      <Image
        key={item.id}
        src={item.url}
        alt=""
        fill
        sizes={STAGE_SIZES}
        className="object-contain"
      />
    );
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[#0b0b0c]/95 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex items-center justify-center transition-[opacity,scale] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] outline-none data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0">
          <DialogPrimitive.Title className="sr-only">
            {reel ? `${reel.title} from @${owner.username}` : "Stories"}
          </DialogPrimitive.Title>

          <DialogPrimitive.Close
            aria-label="Close"
            className="pressable group absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full text-white hover:bg-white/10"
          >
            <XIcon className="size-6 opacity-80 group-hover:opacity-100" />
          </DialogPrimitive.Close>

          <NavButton side="left" onClick={prev} disabled={navigation.atStart} />
          <NavButton side="right" onClick={advance} />

          {/* 9:16 stage, full screen on phones */}
          <div className="relative h-dvh w-full overflow-hidden bg-black sm:[aspect-ratio:9/16] sm:h-[min(92dvh,860px)] sm:w-auto sm:rounded-[14px]">
            {stage}

            {/* Tap zones (mobile), hold to pause */}
            <div
              className="absolute inset-0 grid grid-cols-[1fr_2fr]"
              aria-hidden="true"
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={prev}
                {...holdHandlers}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={advance}
                {...holdHandlers}
              />
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-3 pt-3 pb-10">
              <StoryProgress
                key={`${reel?.key}-${itemIndex}`}
                count={items?.length ?? 1}
                active={itemIndex}
                // Videos advance on `ended` instead; the bar just mirrors playback.
                durationMs={item?.type === "image" ? IMAGE_DURATION_MS : null}
                videoRatio={videoRatio}
                paused={paused}
                onDone={advance}
              />
              <div className="mt-3 flex items-center gap-2.5">
                <Image
                  src={owner.avatar}
                  alt=""
                  width={OWNER_AVATAR_SIZE}
                  height={OWNER_AVATAR_SIZE}
                  className="size-8 rounded-full object-cover outline outline-1 -outline-offset-1 outline-white/20"
                />
                <span className="text-[14px] font-semibold text-white">
                  {owner.username}
                </span>
                <span className="truncate text-[13px] text-white/70">
                  {reel?.title}
                </span>
                <button
                  type="button"
                  onClick={() => setPaused((value) => !value)}
                  aria-label={paused ? "Play" : "Pause"}
                  className="group pointer-events-auto ml-auto grid size-8 place-items-center rounded-full text-white hover:bg-white/10"
                >
                  {paused ? (
                    <PlayIcon className="size-4 translate-x-px fill-current opacity-90 group-hover:opacity-100" />
                  ) : (
                    <PauseIcon className="size-4 fill-current opacity-90 group-hover:opacity-100" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
