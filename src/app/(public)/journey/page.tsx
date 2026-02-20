import type { Metadata } from "next";
import JourneyContent from "./JourneyContent";

export const metadata: Metadata = {
  title: "Buyer Journey | BuyerHQ",
  description: "Track your buying process from preparation to settlement.",
};

export default function JourneyPage() {
  return <JourneyContent />;
}
