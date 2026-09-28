"use client";

import Image from "next/image";
import Link from "next/link";

import { useStories } from "@/components/story-root";
import type { StoryReel } from "@/components/story-viewer";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COVER_SIZE = 72;
// First tooltip waits; neighbours then open instantly.
const TOOLTIP_DELAY_MS = 500;
const ITEM_CLASS = "flex w-[72px] flex-col items-center gap-2 sm:w-[84px]";

const HighlightCover = ({ highlight }: { highlight: StoryReel }) => (
  <>
    <span className="rounded-full bg-white p-[3px] shadow-[0_0_0_1px_rgb(17_17_17/0.08)]">
      <Image
        src={highlight.cover}
        alt=""
        width={COVER_SIZE}
        height={COVER_SIZE}
        className="img-outline bg-sand-100 size-[60px] rounded-full object-cover sm:size-[72px]"
      />
    </span>
    <span className="text-ink/80 w-full truncate text-center text-[12px] font-medium">
      {highlight.title || "Highlight"}
    </span>
  </>
);

export const HighlightsTray = () => {
  const { reels, hasStories, interactive, open } = useStories();
  const offset = hasStories ? 1 : 0;
  const highlights = reels.slice(offset);
  if (highlights.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delay={TOOLTIP_DELAY_MS}>
      <ul
        aria-label="Story highlights"
        className="-mx-4 flex snap-x [scrollbar-width:none] gap-5 overflow-x-auto px-4 pt-1 pb-2 sm:mx-0 sm:gap-7 sm:px-0"
      >
        {highlights.map((highlight, index) => (
          <li key={highlight.key} className="shrink-0 snap-start">
            {interactive ? (
              <button
                type="button"
                onClick={() => open(index + offset)}
                className={cn(
                  "pressable focus-visible:outline-flare rounded-xl focus-visible:outline-2",
                  ITEM_CLASS
                )}
              >
                <HighlightCover highlight={highlight} />
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={<Link href="/accounts/session" />}
                  className={cn("rounded-xl", ITEM_CLASS)}
                >
                  <HighlightCover highlight={highlight} />
                </TooltipTrigger>
                <TooltipPopup>
                  Connect your account to open highlights
                </TooltipPopup>
              </Tooltip>
            )}
          </li>
        ))}
      </ul>
    </TooltipProvider>
  );
};
