import type { Metadata } from "next";

import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign In | BuyerHQ",
  description: "Sign in to continue your BuyerHQ account.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return <LoginContent nextPath={searchParams?.next ?? null} />;
}
