const PROXIED_HOSTS = [/(?:^|\.)cdninstagram\.com$/u, /(?:^|\.)fbcdn\.net$/u];

export const isProxiedHost = (hostname: string): boolean =>
  PROXIED_HOSTS.some((pattern) => pattern.test(hostname));

const hostOf = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

/**
 * Instagram's CDN rejects hotlinked media from other origins, so route those
 * URLs through our own /api/media proxy. Images use next/image instead; this
 * is for video and downloads.
 */
const BASE64_PLUS = /\+/gu;
const BASE64_SLASH = /\//gu;
const BASE64_PADDING = /={1,2}$/u;
const URL_SAFE_DASH = /-/gu;
const URL_SAFE_UNDERSCORE = /_/gu;
const BASE64_BLOCK = 4;

/**
 * Media URLs travel as base64url so no layer can mangle them: a plain
 * `?url=` value gets decoded twice on Cloudflare Workers, which splits it at
 * its own `&` and breaks the CDN signature (403). URLs here are ASCII.
 */
export const encodeMediaUrl = (url: string): string =>
  btoa(url)
    .replace(BASE64_PLUS, "-")
    .replace(BASE64_SLASH, "_")
    .replace(BASE64_PADDING, "");

export const decodeMediaUrl = (encoded: string): string | null => {
  const base64 = encoded
    .replace(URL_SAFE_DASH, "+")
    .replace(URL_SAFE_UNDERSCORE, "/");
  const padding = "=".repeat(
    (BASE64_BLOCK - (base64.length % BASE64_BLOCK)) % BASE64_BLOCK
  );
  try {
    return atob(base64 + padding);
  } catch {
    return null;
  }
};

export const mediaSrc = (url: string, download?: string): string => {
  const host = hostOf(url);
  if (!host || (!isProxiedHost(host) && !download)) {
    return url;
  }
  const params = new URLSearchParams({ u: encodeMediaUrl(url) });
  if (download) {
    params.set("download", download);
  }
  return `/api/media?${params}`;
};
