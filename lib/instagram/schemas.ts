import "server-only";
import { z } from "zod";

/**
 * Shapes of the Instagram responses we read, validated where the JSON enters
 * the app. Only the fields we use are declared; everything else is stripped.
 * Instagram sends `null` freely, so optional fields are `nullish`.
 */

const CountSchema = z.object({ count: z.number() });

// ---- Classic GraphQL "edge_*" shape (web_profile_info) ----

// Carousel children have the same fields but never nest further.
const EdgeChildSchema = z.object({
  dimensions: z.object({ height: z.number(), width: z.number() }).nullish(),
  display_url: z.string(),
  edge_liked_by: CountSchema.nullish(),
  edge_media_preview_like: CountSchema.nullish(),
  edge_media_to_caption: z
    .object({
      edges: z.array(z.object({ node: z.object({ text: z.string() }) })),
    })
    .nullish(),
  edge_media_to_comment: CountSchema.nullish(),
  is_video: z.boolean(),
  product_type: z.string().nullish(),
  shortcode: z.string(),
  taken_at_timestamp: z.number(),
  thumbnail_src: z.string().nullish(),
  video_url: z.string().nullish(),
  video_view_count: z.number().nullish(),
});

export const EdgeNodeSchema = EdgeChildSchema.extend({
  edge_sidecar_to_children: z
    .object({ edges: z.array(z.object({ node: EdgeChildSchema })) })
    .nullish(),
});
export type EdgeChild = z.infer<typeof EdgeChildSchema>;
export type EdgeNode = z.infer<typeof EdgeNodeSchema>;

const EdgesSchema = z.object({
  edges: z.array(z.object({ node: EdgeNodeSchema })),
});

export const WebProfileInfoSchema = z.object({
  // Absent for accounts hidden from logged-out visitors: a bare {"status":"ok"}.
  data: z
    .object({
      user: z
        .object({
          biography: z.string(),
          edge_felix_video_timeline: EdgesSchema.nullish(),
          edge_follow: CountSchema,
          edge_followed_by: CountSchema,
          edge_owner_to_timeline_media: EdgesSchema.extend({
            count: z.number(),
          }),
          external_url: z.string().nullable(),
          full_name: z.string(),
          id: z.string(),
          is_private: z.boolean(),
          is_verified: z.boolean(),
          profile_pic_url: z.string(),
          profile_pic_url_hd: z.string().nullish(),
          username: z.string(),
        })
        .nullable(),
    })
    .optional(),
});
export type EdgeUser = NonNullable<
  NonNullable<z.infer<typeof WebProfileInfoSchema>["data"]>["user"]
>;

// ---- Polaris "xig" shape (logged-out GraphQL and the private API) ----

const CandidateSchema = z.object({
  height: z.number().nullish(),
  url: z.string(),
  width: z.number().nullish(),
});

// Fields every media item has. Carousel children omit `pk`, so only
// top-level media (which needs it for the shortcode) requires it.
const XigMediaFieldsSchema = z.object({
  caption: z.object({ text: z.string() }).nullish(),
  code: z.string().nullish(),
  comment_count: z.number().nullish(),
  display_uri: z.string().nullish(),
  id: z.coerce.string().nullish(),
  image_versions2: z.object({ candidates: z.array(CandidateSchema) }).nullish(),
  like_count: z.number().nullish(),
  // 1 image, 2 video, 8 carousel
  media_type: z.number().nullish(),
  original_height: z.number().nullish(),
  original_width: z.number().nullish(),
  play_count: z.number().nullish(),
  product_type: z.string().nullish(),
  taken_at: z.number().nullish(),
  user: z
    .object({
      full_name: z.string().nullish(),
      is_verified: z.boolean().nullish(),
      profile_pic_url: z.string().nullish(),
      username: z.string(),
    })
    .nullish(),
  video_versions: z.array(CandidateSchema).nullish(),
  view_count: z.number().nullish(),
});
export type XigMediaFields = z.infer<typeof XigMediaFieldsSchema>;

export const XigMediaSchema = XigMediaFieldsSchema.extend({
  carousel_media: z.array(XigMediaFieldsSchema).nullish(),
  pk: z.coerce.string(),
});
export type XigMedia = z.infer<typeof XigMediaSchema>;

export const XigUserSchema = z.object({
  biography: z.string().nullish(),
  external_url: z.string().nullish(),
  follower_count: z.number(),
  following_count: z.number(),
  full_name: z.string(),
  hd_profile_pic_url_info: z.object({ url: z.string() }).nullish(),
  is_private: z.boolean(),
  is_verified: z.boolean(),
  lox_highlights_connection: z
    .object({
      edges: z.array(
        z.object({
          node: z.object({
            cover_media_cropped_thumbnail_url: z.string().nullish(),
            id: z.string(),
            title: z.string(),
          }),
        })
      ),
    })
    .nullish(),
  media_count: z.number().nullish(),
  pk: z.coerce.string(),
  profile_pic_url: z.string(),
  username: z.string(),
});
export type XigUser = z.infer<typeof XigUserSchema>;

const TimelineConnectionSchema = z.object({
  edges: z.array(z.object({ node: XigMediaSchema })),
  page_info: z.object({
    end_cursor: z.string().nullish(),
    has_next_page: z.boolean(),
  }),
});

// ---- GraphQL payloads by query ----

export const UserInfoDataSchema = z.object({
  xig_user_by_igid_v2: XigUserSchema.nullable(),
});

export const TimelineDataSchema = z.object({
  xig_user_by_igid_v2: z
    .object({
      id: z.string(),
      polaris_timeline_connection: TimelineConnectionSchema,
    })
    .nullable(),
});

export const PaginationDataSchema = z.object({
  node: z
    .object({ polaris_timeline_connection: TimelineConnectionSchema })
    .nullable(),
});

export const PostDataSchema = z.object({
  xig_polaris_media: z
    .object({ if_not_gated_logged_out: XigMediaSchema.nullable() })
    .nullish(),
});

export const gqlEnvelope = <T extends z.ZodType>(data: T) =>
  z.object({
    data: data.optional(),
    errors: z
      .array(
        z.object({
          message: z.string().nullish(),
          severity: z.string().nullish(),
        })
      )
      .optional(),
  });

// ---- Private (logged-in) REST API ----

export const ReelsMediaSchema = z.object({
  message: z.string().optional(),
  reels: z
    .record(z.string(), z.object({ items: z.array(XigMediaSchema).optional() }))
    .optional(),
});

/** GET /api/v1/feed/user/{pk}/ */
export const UserFeedSchema = z.object({
  items: z.array(XigMediaSchema),
  more_available: z.boolean().nullish(),
  next_max_id: z.string().nullish(),
});

/** GET /api/v1/media/{pk}/info/ */
export const MediaInfoSchema = z.object({
  items: z.array(XigMediaSchema),
});
