export type ParsedInput =
  | { type: "profile"; username: string }
  | { type: "post"; shortcode: string; reel: boolean };

const USERNAME = /^[\w.]{1,30}$/u;
const SHORTCODE = /^[\w-]{5,40}$/u;
const INSTAGRAM_HOST = /instagram\.com|instagr\.am/iu;
const LEADING_AT = /^@/u;
const RESERVED = new Set([
  "accounts",
  "explore",
  "p",
  "reel",
  "reels",
  "stories",
  "tv",
]);
const POST_PREFIXES = new Set(["p", "reel", "reels", "tv"]);
const NESTED_POST_PREFIXES = new Set(["p", "reel"]);

export const isValidUsername = (value: string): boolean =>
  USERNAME.test(value) && !RESERVED.has(value.toLowerCase());

export const isValidShortcode = (value: string): boolean =>
  SHORTCODE.test(value);

const profile = (username: string): ParsedInput | null =>
  isValidUsername(username)
    ? { type: "profile", username: username.toLowerCase() }
    : null;

const parseUrl = (input: string): URL | null => {
  try {
    return new URL(input.startsWith("http") ? input : `https://${input}`);
  } catch {
    return null;
  }
};

const parseInstagramUrl = (input: string): ParsedInput | null => {
  const url = parseUrl(input);
  const [first, second, third] = url?.pathname.split("/").filter(Boolean) ?? [];
  if (!first) {
    return null;
  }
  if (POST_PREFIXES.has(first) && second && isValidShortcode(second)) {
    return { reel: first !== "p", shortcode: second, type: "post" };
  }
  // instagram.com/<user>/p/<code> and /<user>/reel/<code>
  if (
    second &&
    NESTED_POST_PREFIXES.has(second) &&
    third &&
    isValidShortcode(third)
  ) {
    return { reel: second === "reel", shortcode: third, type: "post" };
  }
  return profile(first);
};

/**
 * Accepts `@user`, `user`, or any instagram.com profile / post / reel URL.
 */
export const parseInput = (raw: string): ParsedInput | null => {
  const input = raw.trim();
  if (!input) {
    return null;
  }
  if (INSTAGRAM_HOST.test(input)) {
    return parseInstagramUrl(input);
  }
  return profile(input.replace(LEADING_AT, ""));
};
