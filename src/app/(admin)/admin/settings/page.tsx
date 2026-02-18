import type { Metadata } from "next";

import AdminSettingsContent from "./AdminSettingsContent";

export const metadata: Metadata = {
  title: "Admin Settings | BuyerHQ",
  description: "Configure moderation and operations settings for admin accounts.",
};

export default function AdminSettingsPage() {
  return <AdminSettingsContent />;
}
