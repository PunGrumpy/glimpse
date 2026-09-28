"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { StoryViewer } from "@/components/story-viewer";
import type { StoryReel } from "@/components/story-viewer";

interface StoryContextValue {
  reels: StoryReel[];
  hasStories: boolean;
  interactive: boolean;
  open: (reelIndex: number) => void;
}

const StoryContext = createContext<StoryContextValue | null>(null);

export const useStories = (): StoryContextValue => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error("useStories must be used inside <StoryRoot>");
  }
  return context;
};

export const StoryRoot = ({
  reels,
  hasStories,
  interactive,
  owner,
  children,
}: {
  reels: StoryReel[];
  hasStories: boolean;
  interactive: boolean;
  owner: { username: string; avatar: string };
  children: React.ReactNode;
}) => {
  const [startIndex, setStartIndex] = useState<number | null>(null);
  // Bumped on every open so the viewer remounts with fresh state; it stays
  // mounted after closing so the exit transition can play.
  const [openCount, setOpenCount] = useState(0);
  const open = useCallback((index: number) => {
    setOpenCount((count) => count + 1);
    setStartIndex(index);
  }, []);
  const close = useCallback(() => setStartIndex(null), []);
  const value = useMemo(
    () => ({ hasStories, interactive, open, reels }),
    [reels, hasStories, interactive, open]
  );
  return (
    <StoryContext.Provider value={value}>
      {children}
      <StoryViewer
        key={openCount}
        reels={reels}
        startIndex={startIndex}
        owner={owner}
        onClose={close}
      />
    </StoryContext.Provider>
  );
};
