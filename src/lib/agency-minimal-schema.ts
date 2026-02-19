import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import { simplifiedBuyerhqrankHeadings } from "@/lib/buyerhqrank-simplified";

const states = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const minimalAgencySchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["agency_name", "state", "verified", "profile_status"],
  properties: {
    agency_name: { type: "string", minLength: 1 },
    state: { enum: states },
    suburbs: { type: "string" },
    specialisations: { type: "string" },
    years_of_experience: { type: "integer", minimum: 0 },
    properties_purchased: { type: "integer", minimum: 0 },
    verified: { enum: ["Verified", "Unverified"] },
    profile_status: { enum: ["Claimed", "Unclaimed"] },
    claimed_at: { type: ["string", "null"] },
    area_specialist: { type: "string" },
    fee_structure: { type: "string" },
    google_rating: { type: "number", minimum: 0, maximum: 5 },
    google_reviews: { type: "integer", minimum: 0 },
    facebook_rating: { type: "number", minimum: 0, maximum: 5 },
    facebook_reviews: { type: "integer", minimum: 0 },
    productreview_rating: { type: "number", minimum: 0, maximum: 5 },
    productreview_reviews: { type: "integer", minimum: 0 },
    trustpilot_rating: { type: "number", minimum: 0, maximum: 5 },
    trustpilot_reviews: { type: "integer", minimum: 0 },
    ratemyagent_rating: { type: "number", minimum: 0, maximum: 5 },
    ratemyagent_reviews: { type: "integer", minimum: 0 },
    profile_description: { type: "string" },
    about: { type: "string" },
    social_media_presence: { enum: ["A+", "A", "B+", "B", "C+", "C", "D+", "D"] },
    total_followers: { type: "integer", minimum: 0 },
    authority_score: { type: "integer", minimum: 0, maximum: 100 },
    instagram_followers: { type: "integer", minimum: 0 },
    facebook_followers: { type: "integer", minimum: 0 },
    tiktok_followers: { type: "integer", minimum: 0 },
    youtube_subscribers: { type: "integer", minimum: 0 },
    linkedin_connections: { type: "integer", minimum: 0 },
    linkedin_followers: { type: "integer", minimum: 0 },
    pinterest_followers: { type: "integer", minimum: 0 },
    x_followers: { type: "integer", minimum: 0 },
    snapchat_followers: { type: "integer", minimum: 0 },
    last_updated: { type: "string" },
  },
} as const;

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
});
addFormats(ajv);
const validateMinimalAgency = ajv.compile(minimalAgencySchema);

export function validateMinimalAgencyRow(row: Record<string, unknown>) {
  const valid = validateMinimalAgency(row);
  if (valid) return { valid: true as const, errors: [] as string[] };
  const errors =
    validateMinimalAgency.errors?.map((item) => `${item.instancePath || "/"} ${item.message ?? "invalid"}`) ?? [];
  return { valid: false as const, errors };
}

export function getMinimalAgencyHeadings() {
  return [...simplifiedBuyerhqrankHeadings];
}
