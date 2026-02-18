import type { Metadata } from "next";

import AdminLogsContent from "./AdminLogsContent";

export const metadata: Metadata = {
  title: "Admin Logs | BuyerHQ",
  description: "Live moderation and platform activity logs.",
};

export default function AdminLogsPage() {
  return <AdminLogsContent />;
}
