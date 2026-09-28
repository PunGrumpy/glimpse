import type { NextRequest } from "next/server";
import type { z } from "zod/mini";

import { statusForError } from "@/lib/api-errors";
import {
  getHighlightItems,
  getStories,
  getVisitorSession,
  InstagramError,
  VISITOR_COOKIE,
} from "@/lib/instagram";
import type { StoriesResponse } from "@/lib/instagram/domain";

type Body = z.infer<typeof StoriesResponse>;

const ID = /^\d{1,30}$/u;

const getStoryItems = async (request: NextRequest): Promise<Response> => {
  const kind = request.nextUrl.searchParams.get("kind");
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const validKind = kind === "highlight" || kind === "user";
  if (!validKind || !ID.test(id)) {
    return Response.json({ error: "bad_request", ok: false } satisfies Body, {
      status: 400,
    });
  }
  const visitor = getVisitorSession(request.cookies.get(VISITOR_COOKIE)?.value);
  try {
    const items =
      kind === "highlight"
        ? await getHighlightItems(id, visitor)
        : await getStories(id, visitor);
    return Response.json({ items, ok: true } satisfies Body);
  } catch (error) {
    if (!(error instanceof InstagramError)) {
      throw error;
    }
    return Response.json({ error: error.code, ok: false } satisfies Body, {
      status: statusForError(error.code),
    });
  }
};

export { getStoryItems as GET };
