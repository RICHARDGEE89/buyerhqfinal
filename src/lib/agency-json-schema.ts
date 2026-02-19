import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import {
  buyerhqrankValues,
  normalizeBlankNumericFields,
  profileStatusValues,
  socialMediaPresenceValues,
  verifiedValues,
} from "@/lib/buyerhqrank";

const stateValues = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const;

const agencyProfileSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "name",
    "email",
    "authority_score",
    "total_followers",
    "social_media_presence",
    "buyerhqrank",
    "profile_status",
    "verified",
    "last_updated",
  ],
  properties: {
    id: { type: "string" },
    created_at: { type: "string", format: "date-time" },
    name: { type: "string", minLength: 1 },
    email: { type: "string", minLength: 3 },
    phone: { type: ["string", "null"] },
    agency_name: { type: ["string", "null"] },
    bio: { type: ["string", "null"] },
    about: { type: ["string", "null"] },
    avatar_url: { type: ["string", "null"] },
    slug: { type: ["string", "null"] },
    state: { enum: [...stateValues, null] },
    suburbs: { type: "array", items: { type: "string" } },
    specializations: { type: "array", items: { type: "string" } },
    years_experience: { type: ["integer", "null"], minimum: 0 },
    properties_purchased: { type: ["integer", "null"], minimum: 0 },
    avg_rating: { type: ["number", "null"], minimum: 0, maximum: 5 },
    review_count: { type: ["integer", "null"], minimum: 0 },
    is_verified: { type: "boolean" },
    is_active: { type: "boolean" },
    licence_number: { type: ["string", "null"] },
    licence_verified_at: { type: ["string", "null"], format: "date-time" },
    website_url: { type: ["string", "null"] },
    linkedin_url: { type: ["string", "null"] },
    fee_structure: { type: ["string", "null"] },

    instagram_followers: { type: "integer", minimum: 0 },
    facebook_followers: { type: "integer", minimum: 0 },
    tiktok_followers: { type: "integer", minimum: 0 },
    youtube_subscribers: { type: "integer", minimum: 0 },
    linkedin_connections: { type: "integer", minimum: 0 },
    linkedin_followers: { type: "integer", minimum: 0 },
    pinterest_followers: { type: "integer", minimum: 0 },
    x_followers: { type: "integer", minimum: 0 },
    snapchat_followers: { type: "integer", minimum: 0 },

    google_rating: { type: "number", minimum: 0, maximum: 5 },
    google_reviews: { type: "integer", minimum: 0 },
    facebook_rating: { type: "number", minimum: 0, maximum: 5 },
    facebook_reviews: { type: "integer", minimum: 0 },
    ratemyagent_rating: { type: "number", minimum: 0, maximum: 5 },
    ratemyagent_reviews: { type: "integer", minimum: 0 },
    trustpilot_rating: { type: "number", minimum: 0, maximum: 5 },
    trustpilot_reviews: { type: "integer", minimum: 0 },
    productreview_rating: { type: "number", minimum: 0, maximum: 5 },
    productreview_reviews: { type: "integer", minimum: 0 },

    total_followers: { type: "integer", minimum: 0 },
    authority_score: { type: "integer", minimum: 0, maximum: 100 },
    social_media_presence: { enum: [...socialMediaPresenceValues] },
    buyerhqrank: { enum: [...buyerhqrankValues] },
    profile_status: { enum: [...profileStatusValues] },
    verified: { enum: [...verifiedValues] },
    claimed_at: { type: ["string", "null"], format: "date-time" },
    last_updated: { type: "string", format: "date-time" },
  },
} as const;

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  coerceTypes: true,
});
addFormats(ajv);

const validateAgencyProfile = ajv.compile(agencyProfileSchema);

export function validateAgencyProfilePayload(raw: Record<string, unknown>) {
  const normalized = normalizeBlankNumericFields(raw);
  const valid = validateAgencyProfile(normalized);
  if (valid) {
    return { valid: true as const, row: normalized, errors: [] as string[] };
  }

  const errors =
    validateAgencyProfile.errors?.map((item) => `${item.instancePath || "/"} ${item.message ?? "invalid"}`) ?? [];

  return { valid: false as const, row: normalized, errors };
}
