import "server-only";
import { Agent, fetch as undiciFetch } from "undici";
import type { RequestInit } from "undici";

// Instagram answers HTTP/1.1 clients on its logged-out API with 429, and Next's
// patched fetch speaks HTTP/1.1, so talk to it through an HTTP/2-capable agent.
const agent = new Agent({ allowH2: true });

export const igFetch = (
  url: string,
  init: Omit<RequestInit, "dispatcher"> = {}
) => undiciFetch(url, { ...init, dispatcher: agent });
