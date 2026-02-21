import type { Metadata } from "next";

import AgentsManagementContent from "./AgentsManagementContent";

export const metadata: Metadata = {
  title: "Admin Agents | BuyerHQ",
  description: "Quick-add and manage agents with verification and lifecycle controls.",
};

export default function AdminAgentsPage() {
  return <AgentsManagementContent />;
}
