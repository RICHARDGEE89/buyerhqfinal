import type { Metadata } from "next";

import ProfileContent from "./ProfileContent";

export const metadata: Metadata = {
  title: "Agent Profile Settings | BuyerHQ",
  description: "Manage your public agent profile details, specializations, and listing quality.",
};

export default function AgentProfileSettingsPage() {
  return <ProfileContent />;
}
