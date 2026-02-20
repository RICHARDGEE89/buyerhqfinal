import type { Metadata } from "next";

import FindAgentsClient from "./FindAgentsClient";

export const metadata: Metadata = {
  title: "Find Agents | BuyerHQ",
  description: "Search BuyerHQ's verified buyer's agent directory by suburb, state and specialist expertise.",
};

export default function FindAgentsPage() {
  return <FindAgentsClient />;
}
