import type { Metadata } from "next";

import AgentsManagementContent from "./AgentsManagementContent";

export const metadata: Metadata = {
  title: "Admin Agents | BuyerHQ",
  description: "Manage verification, active status, and lifecycle of all agent profiles.",
};

export default function AdminAgentsPage() {
  return <AgentsManagementContent />;
}
