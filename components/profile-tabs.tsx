"use client";

import { FilmIcon, Grid3x3Icon } from "lucide-react";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";

export const ProfileTabs = ({
  posts,
  reels,
  reelCount,
}: {
  posts: React.ReactNode;
  reels: React.ReactNode;
  reelCount: number;
}) => (
  <Tabs defaultValue="posts" className="gap-6">
    <TabsList className="mx-auto">
      <TabsTab value="posts">
        <Grid3x3Icon aria-hidden="true" /> Posts
      </TabsTab>
      <TabsTab value="reels" disabled={reelCount === 0}>
        <FilmIcon aria-hidden="true" /> Reels
      </TabsTab>
    </TabsList>
    <TabsPanel value="posts">{posts}</TabsPanel>
    <TabsPanel value="reels">{reels}</TabsPanel>
  </Tabs>
);
