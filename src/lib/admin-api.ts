import type {
  AgentRow,
  AgencyReviewSourceRow,
  BlogPostRow,
  BrokerEnquiryNoteRow,
  BrokerEnquiryStateRow,
  ContactSubmissionRow,
  EnquiryRow,
  ExternalReviewRow,
  ReviewRow,
  Json,
} from "@/lib/database.types";

type AdminPanelResponse = {
  agents: AgentRow[];
  enquiries: EnquiryRow[];
  brokerStates: BrokerEnquiryStateRow[];
  brokerNotes: BrokerEnquiryNoteRow[];
  reviews: ReviewRow[];
  reviewSources: AgencyReviewSourceRow[];
  externalReviews: ExternalReviewRow[];
  posts: BlogPostRow[];
  contacts: ContactSubmissionRow[];
  adminAccount: {
    id: string;
    email: string;
    created_at: string;
    preferences: Json;
  } | null;
  schemaFallback?: boolean;
  policyFallback?: boolean;
  warning?: string;
};

export async function fetchAdminPanelData() {
  const response = await fetch("/api/admin/panel", { cache: "no-store" });
  const payload = (await response.json()) as AdminPanelResponse & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to load admin data.");
  }
  return payload;
}

export async function runAdminAction(action: Record<string, unknown>) {
  const response = await fetch("/api/admin/panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  const payload = (await response.json()) as { success?: boolean; error?: string };
  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Admin action failed.");
  }
  return payload;
}
