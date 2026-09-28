"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  getConnectedAccount,
  getVisitorSession,
  VISITOR_COOKIE,
} from "@/lib/instagram";

export type ConnectState =
  | { status: "idle" }
  | { status: "error"; message: string };

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;
const SessionField = z.string().trim();

/**
 * Stores the visitor's sessionid in an httpOnly cookie on their own browser.
 * It is never written to disk or logs on our side; it only rides along with
 * their requests so we can ask Instagram on their behalf.
 */
export const connectSession = async (
  _previous: ConnectState,
  form: FormData
): Promise<ConnectState> => {
  const field = SessionField.safeParse(form.get("sessionid"));
  const sessionId = field.success ? field.data : "";
  const session = getVisitorSession(sessionId);
  if (!session) {
    return {
      message:
        "That doesn't look like a sessionid. It starts with your numeric user id, like 1234567890%3A…",
      status: "error",
    };
  }
  try {
    await getConnectedAccount(session);
  } catch {
    return {
      message: "Couldn't find the Instagram account for this session.",
      status: "error",
    };
  }
  const store = await cookies();
  store.set(VISITOR_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: THIRTY_DAYS_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  refresh();
  return { status: "idle" };
};

// Only ever deletes the caller's own cookie, and Next checks the Origin of
// server action requests, so there is nothing to authorize here.
// oxlint-disable-next-line react-doctor/server-auth-actions -- self-scoped: removes the requester's own session cookie.
export const disconnectSession = async (): Promise<void> => {
  const store = await cookies();
  store.delete(VISITOR_COOKIE);
  refresh();
};
