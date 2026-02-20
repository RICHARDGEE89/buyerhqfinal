import type { Metadata } from "next";
import ToolsContent from "./ToolsContent";

export const metadata: Metadata = {
  title: "Calculator Tools | BuyerHQ",
  description: "Use BuyerHQ calculators to estimate borrowing power, repayments, and stamp duty.",
};

export default function ToolsPage() {
  return <ToolsContent />;
}
