"use client";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  FilmIcon,
  ImageIcon,
  UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Clouds } from "@/components/clouds";
import { SearchForm } from "@/components/search-form";
import { cn } from "@/lib/utils";

const MODES = [
  {
    icon: UserRoundIcon,
    id: "profile",
    label: "Profiles",
    link: false,
    placeholder: "@username",
    word: 0,
  },
  {
    icon: FilmIcon,
    id: "reel",
    label: "Reels",
    link: true,
    placeholder: "instagram.com/reel/…",
    word: 1,
  },
  {
    icon: ImageIcon,
    id: "post",
    label: "Posts",
    link: true,
    placeholder: "instagram.com/p/…",
    word: 2,
  },
] as const;

const WORDS = ["Look.", "Watch.", "Save."];
const EXAMPLES = ["instagram", "muse", "lalalalisa_m"];

const PREVIEW_TILES = [
  "from-[#ffc7a1] to-[#ff7038]",
  "from-[#d9d2f2] to-[#8f7bd6]",
  "from-[#ffe1a8] to-[#f2a93b]",
  "from-[#fcd2cf] to-[#e0607a]",
  "from-[#cfe7dc] to-[#4f9a86]",
  "from-[#ffd9c2] to-[#d63c01]",
];

/** Stylised app window so the hero shows what you get, like cap.so's device frame. */
const ProductPreview = () => (
  <div
    aria-hidden="true"
    className="relative mx-auto h-[240px] max-w-[1120px] overflow-hidden px-4 sm:h-[340px] sm:px-10"
  >
    {/* Outer radius 22 = inner 14 + 8px bezel */}
    <div className="bg-ink rounded-t-[22px] p-2 pb-0 shadow-[0_30px_80px_-30px_rgb(17_17_17/0.45)]">
      <div className="overflow-hidden rounded-t-[14px] bg-white">
        <div className="border-line flex h-9 items-center gap-1.5 border-b px-3.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="bg-sand-50 text-ink/45 mx-auto h-5 w-56 rounded-md text-center font-mono text-[10.5px] leading-5">
            glimpse.app/username
          </span>
        </div>
        <div className="px-6 pt-8 sm:px-16">
          <div className="flex items-center gap-5 sm:gap-8">
            <div className="to-flare ring-flare-50 size-16 shrink-0 rounded-full bg-gradient-to-br from-[#ffc7a1] ring-4 sm:size-20" />
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="bg-ink/80 h-3.5 w-32 rounded-full" />
              <div className="flex gap-4">
                <div className="bg-ink/15 h-2.5 w-14 rounded-full" />
                <div className="bg-ink/15 h-2.5 w-16 rounded-full" />
                <div className="bg-ink/15 h-2.5 w-14 rounded-full" />
              </div>
              <div className="bg-ink/10 h-2.5 w-3/5 max-w-72 rounded-full" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {PREVIEW_TILES.map((tile) => (
              <div
                key={tile}
                className={cn(
                  "aspect-[4/3] rounded-lg bg-gradient-to-br sm:rounded-xl",
                  tile
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Hero = () => {
  const [mode, setMode] = useState<(typeof MODES)[number] | null>(null);

  return (
    <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
      <div className="relative isolate overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgb(17_17_17/0.045)]">
        <div
          aria-hidden="true"
          className="sunset pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute bottom-[4%] left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#fff4d6_0%,#ffd88a_42%,rgb(255_170_90/0)_70%)] sm:size-[40rem]" />
          <div className="absolute inset-x-0 top-0 h-[70%]">
            <Clouds />
          </div>
          <div className="grain absolute inset-0 opacity-70" />
        </div>
        <section
          id="search"
          className="relative px-5 pt-12 pb-16 sm:pt-14 md:pt-[56px] md:pb-20"
        >
          <div className="relative mx-auto flex max-w-[1020px] flex-col items-center text-center">
            <Link
              href="/#features"
              className="pressable group bg-ink mb-7 inline-flex max-w-full items-center gap-2.5 rounded-full py-1.5 pr-3.5 pl-1.5 text-[13px] leading-none text-white shadow-[0_1px_2px_rgb(17_17_17/0.12),0_10px_24px_-14px_rgb(17_17_17/0.6)] hover:bg-[#2a2a2a] md:mb-9"
            >
              <span className="text-ink rounded-full bg-[#ffb48f] px-2 py-[5px] font-mono text-[10.5px] leading-none tracking-[0.06em] uppercase">
                New
              </span>
              <span className="truncate">Reels now play with sound</span>
              <span className="hidden text-white/60 group-hover:text-white sm:inline">
                See what&apos;s new
              </span>
              <ArrowRightIcon
                className="size-3.5 text-white opacity-60 group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>

            <div className="pb-10 md:pb-14">
              <fieldset
                aria-label="What do you want to view?"
                className="border-line mx-auto flex w-fit items-center gap-0.5 rounded-full border bg-white/70 p-1 shadow-[0_1px_2px_rgb(17_17_17/0.04)] backdrop-blur-sm"
              >
                {MODES.map((option) => {
                  const active = mode?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMode(active ? null : option)}
                      className={cn(
                        "pressable flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] leading-none font-medium whitespace-nowrap",
                        "focus-visible:ring-flare focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
                        active
                          ? "text-ink bg-white shadow-[0_1px_2px_rgb(17_17_17/0.08),0_0_0_1px_rgb(17_17_17/0.06)]"
                          : "text-ink hover:bg-sand-100 hover:text-ink opacity-50"
                      )}
                    >
                      <option.icon className="size-3.5" aria-hidden="true" />
                      {option.label}
                    </button>
                  );
                })}
              </fieldset>
            </div>

            <h1 className="flex flex-col items-center text-[clamp(40px,5.6vw,74px)] leading-[0.98] font-normal tracking-[-0.03em] sm:flex-row sm:gap-[0.26em]">
              {WORDS.map((word, index) => (
                <span
                  key={word}
                  className={cn(
                    "transition-colors duration-300 ease-out",
                    mode && mode.word !== index ? "text-ink/20" : "text-ink"
                  )}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p className="text-ink/75 mt-8 max-w-[660px] font-serif text-[16.5px] leading-[1.5] font-light tracking-[-0.01em] text-balance sm:text-[19px] md:mt-10">
              View public Instagram profiles, posts and reels without an
              account. Paste a username or a link, browse anonymously, and save
              what you like in full resolution.
            </p>

            <SearchForm
              className="mt-9 max-w-[560px]"
              placeholder={
                mode?.placeholder ?? "username or instagram.com link"
              }
              expectsLink={mode?.link ?? false}
            />

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-2.5">
              <a
                href="#how"
                className="pressable group border-line-strong hover:bg-sand-50 inline-flex h-[42px] items-center gap-2.5 rounded-[10px] border bg-white pr-2.5 pl-5 text-[15px]"
              >
                See how Glimpse works
                <span className="bg-sand-100 text-ink group-hover:bg-line grid size-6 place-items-center rounded-full">
                  <ArrowDownIcon
                    className="size-3.5 opacity-65 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </span>
              </a>
            </div>

            <div className="text-ink/60 mt-5 flex flex-wrap items-center justify-center gap-2 text-[14px]">
              <span>Try</span>
              {EXAMPLES.map((name) => (
                <Link
                  key={name}
                  href={`/${name}`}
                  className="text-ink decoration-ink/30 hover:decoration-flare rounded-[7px] px-1.5 py-0.5 underline underline-offset-4"
                >
                  @{name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ProductPreview />
      </div>
    </div>
  );
};
