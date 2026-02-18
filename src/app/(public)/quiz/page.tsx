import type { Metadata } from "next";
import QuizContent from "./QuizContent";

export const metadata: Metadata = {
  title: "Match Quiz | BuyerHQ",
  description: "Answer a few questions and get matched with verified buyer's agents.",
};

export default function QuizPage() {
  return <QuizContent />;
}
