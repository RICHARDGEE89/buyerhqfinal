import type { Metadata } from "next";

import LeadsContent from "./LeadsContent";

export const metadata: Metadata = {
  title: "Agent Leads | BuyerHQ",
  description: "Review and manage incoming buyer enquiries.",
};

export default function AgentLeadsPage() {
  return <LeadsContent />;
}
