import "server-only";

/**
 * Instagram `sessionid` cookies, from two places:
 *
 * - **Service account** (`IG_SESSION_ID`, set by the site owner): lets every
 *   visitor watch stories and highlights without entering anything. Only used
 *   for data that is public to any logged-in account, and safe to cache.
 * - **Visitor account** (pasted on /accounts/session, kept in an httpOnly
 *   cookie): unlocks what that visitor's own account can see, including
 *   private accounts they follow. Never cached or shared across visitors.
 *
 * Automated use is against Instagram's terms; use secondary accounts.
 */

export const VISITOR_COOKIE = "peek_ig_session";

// "<numeric user id>%3A<token>…" (URL-encoded) or with a literal colon.
const SESSION_ID = /^(?<userId>\d{1,20})(?:%3A|:)[\w%:.-]{8,300}$/u;

export interface InstagramSession {
  /** Who the session belongs to; decides caching. */
  owner: "service" | "visitor";
  /** Value for the Cookie request header. */
  cookie: string;
  /** Instagram user id encoded in the session. */
  userId: string;
}

export const parseSessionId = (
  raw: string,
  owner: InstagramSession["owner"]
): InstagramSession | null => {
  const sessionId = raw.trim();
  const userId = SESSION_ID.exec(sessionId)?.groups?.userId;
  if (!userId) {
    return null;
  }
  return {
    cookie: `sessionid=${sessionId}; ds_user_id=${userId}`,
    owner,
    userId,
  };
};

export const getServiceSession = (): InstagramSession | null =>
  parseSessionId(process.env.IG_SESSION_ID ?? "", "service");

export const getVisitorSession = (
  cookieValue: string | undefined
): InstagramSession | null =>
  cookieValue ? parseSessionId(cookieValue, "visitor") : null;
