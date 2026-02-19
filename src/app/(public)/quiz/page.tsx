import type { Metadata } from "next";
import QuizContent from "./QuizContent";

export const metadata: Metadata = {
  title: "Match Quiz | BuyerHQ",
  description: "Answer a few questions, get matched, and submit a brokered enquiry through BuyerHQ.",
};

export default function QuizPage() {
  return <QuizContent />;
}
