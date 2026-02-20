import type { Metadata } from "next";
import BuyerProfileContent from "./BuyerProfileContent";

export const metadata: Metadata = {
  title: "Buyer DNA Profile | BuyerHQ",
  description: "Complete a short buyer profile to understand your style and ideal agent fit.",
};

export default function BuyerProfilePage() {
  return <BuyerProfileContent />;
}
