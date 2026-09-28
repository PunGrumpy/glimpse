import type { InstagramErrorCode } from "@/lib/instagram/types";

const STATUS_BY_CODE = new Map<InstagramErrorCode, number>([
  ["login_required", 401],
  ["not_found", 404],
  ["private", 403],
  ["rate_limited", 429],
  ["restricted", 403],
  ["upstream", 502],
]);

const BAD_GATEWAY = 502;

/** HTTP status for an Instagram failure surfaced by our API routes. */
export const statusForError = (code: InstagramErrorCode): number =>
  STATUS_BY_CODE.get(code) ?? BAD_GATEWAY;
