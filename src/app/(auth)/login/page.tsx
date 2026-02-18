import type { Metadata } from "next";

import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign In | BuyerHQ",
  description: "Sign in to your BuyerHQ buyer dashboard, agent portal, or admin console.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return <LoginContent nextPath={searchParams?.next ?? null} />;
}
