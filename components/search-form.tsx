"use client";

import { ArrowRightIcon, AtSignIcon, LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { parseInput } from "@/lib/instagram/parse-input";
import type { ParsedInput } from "@/lib/instagram/parse-input";
import { cn } from "@/lib/utils";

const hrefFor = (parsed: ParsedInput): string => {
  if (parsed.type === "profile") {
    return `/${parsed.username}`;
  }
  return `/${parsed.reel ? "reel" : "p"}/${parsed.shortcode}`;
};

export const SearchForm = ({
  className,
  placeholder = "username or instagram.com link",
  expectsLink = false,
}: {
  className?: string;
  placeholder?: string;
  expectsLink?: boolean;
}) => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const Icon = expectsLink ? LinkIcon : AtSignIcon;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseInput(value);
    if (!parsed) {
      setError(
        "Enter a username like @instagram, or paste a post or reel link."
      );
      return;
    }
    setError(null);
    startTransition(() => router.push(hrefFor(parsed)));
  };

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)} noValidate>
      <div
        className={cn(
          "flex flex-col gap-1.5 rounded-[18px] border bg-white p-1.5 shadow-[0_1px_2px_rgb(17_17_17/0.04),0_18px_40px_-18px_rgb(214_60_1/0.45)] transition-[border-color,box-shadow] duration-200 sm:flex-row",
          "focus-within:border-flare-300 focus-within:shadow-[0_0_0_4px_rgb(255_112_56/0.18),0_18px_40px_-18px_rgb(214_60_1/0.45)]",
          error ? "border-red-300" : "border-line"
        )}
      >
        <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 px-3.5">
          <Icon
            className="text-ink size-[18px] shrink-0 opacity-40"
            aria-hidden="true"
          />
          <span className="sr-only">Instagram username or link</span>
          <input
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "search-error" : undefined}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            className="text-ink placeholder:text-ink/40 h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none"
            enterKeyHint="go"
            onChange={(event) => {
              setValue(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder={placeholder}
            spellCheck={false}
            value={value}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary pressable inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[12px] pr-5 pl-6 text-[16px] font-medium disabled:opacity-70"
        >
          {pending ? "Opening…" : "View"}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p
        id="search-error"
        role="alert"
        className="mt-2 min-h-5 text-[13px] text-red-600"
      >
        {error}
      </p>
    </form>
  );
};
