import "server-only";
import { cookies } from "next/headers";

import { getVisitorSession, VISITOR_COOKIE } from "@/lib/instagram";
import type { InstagramSession } from "@/lib/instagram";

/** The current visitor's own Instagram session, if they connected one. */
export const getVisitor = async (): Promise<InstagramSession | null> => {
  const store = await cookies();
  return getVisitorSession(store.get(VISITOR_COOKIE)?.value);
};
