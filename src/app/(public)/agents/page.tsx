import type { Metadata } from "next";

import AgentsClientOnly from "./AgentsClientOnly";

export const metadata: Metadata = {
  title: "Find Agents | BuyerHQ",
  description:
    "Search BuyerHQ's buyer's agent directory by suburb or postcode across Australia with state and specialization filters.",
};

export default function AgentsPage() {
  return <AgentsClientOnly />;
}
