import type { Metadata } from "next";

import AgentsManagementContent from "./AgentsManagementContent";

export const metadata: Metadata = {
  title: "Admin Agents | BuyerHQ",
  description: "Spreadsheet-style operations for agent lifecycle, claim status, and BUYERHQRANK quality control.",
};

export default function AdminAgentsPage() {
  return <AgentsManagementContent />;
}
