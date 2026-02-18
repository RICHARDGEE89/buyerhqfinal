import type { Metadata } from "next";

import AgentPortalContent from "./AgentPortalContent";

export const metadata: Metadata = {
  title: "Agent Portal | BuyerHQ",
  description: "Manage enquiries, profile completion, and lead activity in the agent portal.",
};

export default function AgentDashboardPage() {
  return <AgentPortalContent />;
}
