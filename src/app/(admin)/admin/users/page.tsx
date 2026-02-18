import type { Metadata } from "next";

import UsersManagementContent from "./UsersManagementContent";

export const metadata: Metadata = {
  title: "Admin Users | BuyerHQ",
  description: "Review user activity across agents and buyers.",
};

export default function AdminUsersPage() {
  return <UsersManagementContent />;
}
