import type { Metadata } from "next";

import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Agent Login | BuyerHQ",
  description: "Sign in to the BuyerHQ agent portal.",
};

export default function AgentPortalLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return <LoginContent nextPath={searchParams?.next} />;
}
