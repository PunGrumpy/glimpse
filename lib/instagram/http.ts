import "server-only";
import type { Agent } from "undici";

/**
 * Instagram's REST profile endpoint answers HTTP/1.1 clients with 429, so on
 * Node we talk to it through an HTTP/2-capable undici agent (Next's patched
 * fetch speaks HTTP/1.1). Cloudflare Workers can't open raw HTTP/2
 * connections (no ALPN), so there we use the platform fetch and callers skip
 * the REST endpoint (see `supportsHttp2`).
 */

/** Cloudflare Workers identify themselves through `navigator.userAgent`. */
const isWorkers = globalThis.navigator?.userAgent === "Cloudflare-Workers";

export const supportsHttp2 = !isWorkers;

export interface IgRequestInit {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: URLSearchParams;
}

/** The parts of a response callers read; satisfied by both fetch flavours. */
export type IgResponse = Pick<Response, "ok" | "status" | "json" | "text">;

let agent: Agent | undefined;

const nodeFetch = async (
  url: string,
  init: IgRequestInit
): Promise<IgResponse> => {
  // Loaded lazily so the Workers bundle never evaluates undici's socket setup.
  const undici = await import("undici");
  agent ??= new undici.Agent({ allowH2: true });
  return undici.fetch(url, { ...init, dispatcher: agent });
};

export const igFetch = (
  url: string,
  init: IgRequestInit = {}
): Promise<IgResponse> =>
  isWorkers ? fetch(url, { ...init, cache: "no-store" }) : nodeFetch(url, init);
