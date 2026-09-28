import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";

import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400"],
});

const DESCRIPTION =
  "View public Instagram profiles, posts, reels and stories anonymously. No account, no login, no tracking.";

export const metadata: Metadata = {
  applicationName: "Glimpse",
  description: DESCRIPTION,
  // Makes the generated opengraph-image URL absolute for link previews.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    description: DESCRIPTION,
    siteName: "Glimpse",
    type: "website",
  },
  title: {
    default: "Glimpse — view Instagram without an account",
    template: "%s · Glimpse",
  },
  twitter: { card: "summary_large_image" },
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    lang="en"
    data-scroll-behavior="smooth"
    className={cn(
      "h-full scroll-smooth antialiased",
      geist.variable,
      geistMono.variable,
      sourceSerif.variable,
      "[--font-heading:var(--font-sans)]"
    )}
  >
    <body className="text-ink flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </body>
  </html>
);

export default RootLayout;
