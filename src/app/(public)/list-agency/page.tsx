import type { Metadata } from "next";
import ListAgencyContent from "./ListAgencyContent";

export const metadata: Metadata = {
  title: "List Your Agency | BuyerHQ",
  description: "Apply to list your buyer's agency on BuyerHQ.",
};

export default function ListAgencyPage() {
  return <ListAgencyContent />;
}
