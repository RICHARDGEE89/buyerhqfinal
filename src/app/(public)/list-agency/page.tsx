import type { Metadata } from "next";
import ListAgencyContent from "./ListAgencyContent";

export const metadata: Metadata = {
  title: "Create Agent Profile | BuyerHQ",
  description: "Create your buyer's agent profile for admin review and managed onboarding on BuyerHQ.",
};

export default function ListAgencyPage() {
  return <ListAgencyContent />;
}
