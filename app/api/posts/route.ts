import type { NextRequest } from "next/server";
import type { z } from "zod/mini";

import { statusForError } from "@/lib/api-errors";
import {
  getMorePosts,
  getVisitorSession,
  InstagramError,
  VISITOR_COOKIE,
} from "@/lib/instagram";
import type { PostsResponse } from "@/lib/instagram/domain";

type Body = z.infer<typeof PostsResponse>;

const USER_ID = /^\d{1,30}$/u;
const MAX_TOKEN_LENGTH = 512;

const getPosts = async (request: NextRequest): Promise<Response> => {
  const params = request.nextUrl.searchParams;
  const user = params.get("user") ?? "";
  const next = params.get("next") ?? undefined;
  const invalid = !USER_ID.test(user) || (next?.length ?? 0) > MAX_TOKEN_LENGTH;
  if (invalid) {
    return Response.json({ error: "bad_request", ok: false } satisfies Body, {
      status: 400,
    });
  }
  // Private feeds page through the visitor's own session.
  const privateFeed =
    params.get("feed") === "private"
      ? getVisitorSession(request.cookies.get(VISITOR_COOKIE)?.value)
      : null;
  try {
    const page = await getMorePosts(user, next, privateFeed);
    return Response.json({ ok: true, ...page } satisfies Body);
  } catch (error) {
    if (!(error instanceof InstagramError)) {
      throw error;
    }
    return Response.json({ error: error.code, ok: false } satisfies Body, {
      status: statusForError(error.code),
    });
  }
};

export { getPosts as GET };
