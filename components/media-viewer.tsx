"use client";

import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";

import type { MediaItem } from "@/lib/instagram/types";
import { mediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";

// Instagram crops feed media between 9:16 and 1.91:1.
const MIN_RATIO = 9 / 16;
const MAX_RATIO = 1.91;
const VIEWER_SIZES = "(min-width: 1024px) 760px, 100vw";

const NavButton = ({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) => {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "pressable text-ink absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
};

const Slide = ({ item }: { item: MediaItem }) => {
  if (item.type === "video") {
    return (
      // oxlint-disable-next-line jsx-a11y/media-has-caption -- Instagram provides no caption tracks for posts.
      <video
        src={mediaSrc(item.url)}
        poster={mediaSrc(item.thumbnail)}
        controls
        playsInline
        loop
        className="size-full object-contain"
      />
    );
  }
  return (
    <Image
      src={item.url}
      alt=""
      fill
      sizes={VIEWER_SIZES}
      className="object-contain"
    />
  );
};

const slideLabel = (item: MediaItem, index: number, total: number): string => {
  if (total > 1) {
    return `${index + 1} / ${total}`;
  }
  return item.type === "video" ? "Video" : "Photo";
};

export const MediaViewer = ({
  media,
  shortcode,
}: {
  media: MediaItem[];
  shortcode: string;
}) => {
  const [index, setIndex] = useState(0);
  const item = media[index];
  const multiple = media.length > 1;

  const go = (delta: number) =>
    setIndex((current) => (current + delta + media.length) % media.length);

  // Arrow keys page through carousels, like Instagram's web viewer.
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      go(-1);
    } else if (event.key === "ArrowRight") {
      go(1);
    }
  });
  useEffect(() => {
    if (!multiple) {
      return;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [multiple]);

  if (!item) {
    return null;
  }
  const ratio = Math.min(
    Math.max(item.width / item.height, MIN_RATIO),
    MAX_RATIO
  );
  const extension = item.type === "video" ? "mp4" : "jpg";
  const suffix = multiple ? `-${index + 1}` : "";
  const filename = `${shortcode}${suffix}.${extension}`;

  return (
    <div className="flex flex-col gap-3">
      <section
        aria-roledescription={multiple ? "carousel" : undefined}
        aria-label={
          multiple ? `Slide ${index + 1} of ${media.length}` : "Post media"
        }
        className="border-line/70 bg-ink relative mx-auto w-full overflow-hidden rounded-2xl border"
        style={{ aspectRatio: ratio, maxHeight: "min(80vh, 820px)" }}
      >
        <Slide key={item.url} item={item} />

        {multiple && (
          <>
            <NavButton
              side="left"
              onClick={() => go(-1)}
              label="Previous slide"
            />
            <NavButton side="right" onClick={() => go(1)} label="Next slide" />
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {media.map((slide, slideIndex) => (
                <button
                  key={slide.url}
                  type="button"
                  aria-label={`Go to slide ${slideIndex + 1}`}
                  aria-current={slideIndex === index}
                  onClick={() => setIndex(slideIndex)}
                  className={cn(
                    "h-1.5 rounded-full bg-white transition-[width,opacity] duration-200",
                    slideIndex === index
                      ? "w-4"
                      : "w-1.5 opacity-50 hover:opacity-80"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <div className="flex items-center justify-between gap-3">
        <span className="text-ink/55 text-[13px] tabular-nums">
          {slideLabel(item, index, media.length)}
        </span>
        <a
          href={mediaSrc(item.url, filename)}
          download={filename}
          className="btn-primary pressable inline-flex h-9 items-center gap-2 rounded-[10px] px-4 text-[14px] font-medium"
        >
          <DownloadIcon className="size-4" aria-hidden="true" />
          Download {item.type === "video" ? "video" : "photo"}
        </a>
      </div>
    </div>
  );
};
