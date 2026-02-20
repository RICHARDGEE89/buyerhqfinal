import type { Metadata } from "next";
import FAQContent from "./FAQContent";

export const metadata: Metadata = {
  title: "FAQ | BuyerHQ",
  description: "Frequently asked questions about BuyerHQ and buyer's agent engagement.",
};

export default function FAQPage() {
  return <FAQContent />;
}
