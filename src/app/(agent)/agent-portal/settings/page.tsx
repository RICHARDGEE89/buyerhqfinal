import type { Metadata } from "next";

import SettingsContent from "./SettingsContent";

export const metadata: Metadata = {
  title: "Agent Settings | BuyerHQ",
  description: "Manage account notifications, preferences, and security settings for your agent portal.",
};

export default function AgentSettingsPage() {
  return <SettingsContent />;
}
