import type { Metadata } from "next";

import AgentsClientOnly from "./AgentsClientOnly";

export const metadata: Metadata = {
  title: "Find Agents | BuyerHQ",
  description:
    "Search BuyerHQ's verified buyer's agent directory with state, specialization, and rating filters.",
};

export default function AgentsPage() {
  return <AgentsClientOnly />;
}
