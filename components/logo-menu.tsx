"use client";

import { DownloadIcon, ImageIcon, TypeIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Logo } from "@/components/logo";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toastManager } from "@/components/ui/toast";
import { logoSvg, wordmarkSvg } from "@/lib/brand";
import { copyText, downloadLogoPng } from "@/lib/brand-export";

interface BrandAction {
  icon: LucideIcon;
  label: string;
  success: string;
  run: () => Promise<void>;
}

const ACTIONS: BrandAction[] = [
  {
    icon: ImageIcon,
    label: "Copy Logo as SVG",
    run: () => copyText(logoSvg()),
    success: "Logo copied as SVG",
  },
  {
    icon: TypeIcon,
    label: "Copy Wordmark as SVG",
    run: () => copyText(wordmarkSvg()),
    success: "Wordmark copied as SVG",
  },
  {
    icon: DownloadIcon,
    label: "Download Logo as PNG",
    run: downloadLogoPng,
    success: "Logo downloaded",
  },
];

const runAction = async (action: BrandAction): Promise<void> => {
  try {
    await action.run();
    toastManager.add({ title: action.success, type: "success" });
  } catch {
    toastManager.add({
      description: "Your browser blocked it. Try again.",
      title: "Something went wrong",
      type: "error",
    });
  }
};

/**
 * Header logo with a brand menu on right-click (also the Menu key /
 * Shift+F10, and long-press on touch). A normal click still goes home.
 */
export const LogoMenu = () => (
  <ContextMenu>
    <ContextMenuTrigger className="rounded-md">
      <Logo />
    </ContextMenuTrigger>
    <ContextMenuPopup
      align="start"
      className="w-60 transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0"
    >
      {ACTIONS.map((action) => (
        <ContextMenuItem
          key={action.label}
          onClick={() => {
            runAction(action);
          }}
          className="gap-2.5"
        >
          <action.icon className="text-ink opacity-60" aria-hidden="true" />
          {action.label}
        </ContextMenuItem>
      ))}
    </ContextMenuPopup>
  </ContextMenu>
);
