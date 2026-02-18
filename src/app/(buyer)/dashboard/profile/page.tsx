import type { Metadata } from "next";

import ProfileContent from "./ProfileContent";

export const metadata: Metadata = {
  title: "Buyer Profile | BuyerHQ",
  description: "Manage your buyer profile preferences and match requirements.",
};

export default function BuyerProfilePage() {
  return <ProfileContent />;
}
