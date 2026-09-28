import type { NextRequest } from "next/server";

import { isProxiedHost } from "@/lib/media";

const PASSTHROUGH = [
  "accept-ranges",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
];
const UNSAFE_FILENAME_CHARS = /[^\w.-]/gu;
const PARTIAL_CONTENT = 206;

const parseTarget = (raw: string | null): URL | null => {
  try {
    return new URL(raw ?? "");
  } catch {
    return null;
  }
};

// Only the Instagram CDN; anything else would make this an open proxy.
const isAllowed = (target: URL, download: string | null): boolean => {
  if (target.protocol !== "https:") {
    return false;
  }
  const mockDownload = process.env.IG_PROVIDER === "mock" && Boolean(download);
  return isProxiedHost(target.hostname) || mockDownload;
};

const proxyMedia = async (request: NextRequest): Promise<Response> => {
  const target = parseTarget(request.nextUrl.searchParams.get("url"));
  const download = request.nextUrl.searchParams.get("download");
  if (!target) {
    return new Response("Invalid url", { status: 400 });
  }
  if (!isAllowed(target, download)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const range = request.headers.get("range");
  const upstream = await fetch(target, {
    cache: "no-store",
    headers: range ? { Range: range } : undefined,
  });
  if (!upstream.ok && upstream.status !== PARTIAL_CONTENT) {
    return new Response("Upstream error", {
      status: upstream.status === 404 ? 404 : 502,
    });
  }

  const headers = new Headers();
  for (const name of PASSTHROUGH) {
    const value = upstream.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  headers.set("cache-control", "public, max-age=86400, immutable");
  if (download) {
    const safe = download.replaceAll(UNSAFE_FILENAME_CHARS, "_");
    headers.set("content-disposition", `attachment; filename="${safe}"`);
  }
  return new Response(upstream.body, { headers, status: upstream.status });
};

export { proxyMedia as GET };
