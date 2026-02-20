import type { Metadata } from "next";

import FindAgentsClient from "../find-agents/FindAgentsClient";

export const metadata: Metadata = {
  title: "Find Agents | BuyerHQ",
  description:
    "Search BuyerHQ's buyer's agent directory by suburb or postcode across Australia with brokered enquiry workflows.",
};

export default function AgentsPage() {
  return <FindAgentsClient />;
}
