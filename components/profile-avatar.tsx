"use client";

import Image from "next/image";

import { useStories } from "@/components/story-root";
import { cn } from "@/lib/utils";

const AVATAR_SIZE = 144;

export const ProfileAvatar = ({
  src,
  username,
}: {
  src: string;
  username: string;
}) => {
  const { hasStories, open } = useStories();
  const image = (
    <Image
      src={src}
      alt=""
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      preload
      className="img-outline bg-sand-100 size-28 rounded-full border-[3px] border-white object-cover sm:size-36"
    />
  );
  return (
    <div
      className={cn(
        "shrink-0 rounded-full p-[3px]",
        hasStories
          ? "bg-[conic-gradient(from_210deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)]"
          : "from-flare-50 to-line-strong bg-gradient-to-b shadow-[0_10px_24px_-12px_rgb(255_112_56/0.55)]"
      )}
    >
      {hasStories ? (
        <button
          type="button"
          onClick={() => open(0)}
          aria-label={`Watch @${username}'s story`}
          className="pressable focus-visible:outline-flare block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {image}
        </button>
      ) : (
        image
      )}
    </div>
  );
};
