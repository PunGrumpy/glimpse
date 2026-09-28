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
export const mediaSrc = (url: string, download?: string): string => {
  const host = hostOf(url);
  if (!host || (!isProxiedHost(host) && !download)) {
    return url;
  }
  const params = new URLSearchParams({ url });
  if (download) {
    params.set("download", download);
  }
  return `/api/media?${params}`;
};
