import type { z } from "zod/mini";

type Schema<T> = z.ZodMiniType<T>;

/** Parses the body with `schema`; `null` when it isn't JSON at all. */
const parseBody = async <T>(res: Response, schema: Schema<T>) => {
  try {
    return schema.safeParse(await res.json());
  } catch {
    return null;
  }
};

/**
 * Fetches one of our own JSON endpoints and validates the body. Our error
 * responses are typed `{ ok: false, error }` bodies, so a non-2xx status is
 * still parsed; only a body that doesn't match the schema is a failure.
 */
export const fetchJson = async <T>(
  url: string,
  schema: Schema<T>,
  signal?: AbortSignal
): Promise<T> => {
  const res = await fetch(url, { signal });
  const parsed = await parseBody(res, schema);
  if (parsed?.success) {
    return parsed.data;
  }
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  throw new Error(`Unexpected response from ${url}`);
};
