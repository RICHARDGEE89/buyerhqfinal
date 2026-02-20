import type { Metadata } from "next";
import QuizContent from "../quiz/QuizContent";

export const metadata: Metadata = {
  title: "Match Quiz | BuyerHQ",
  description:
    "Answer a few questions about your goals, budget, and location to get matched with verified buyer's agents.",
};

export default function MatchQuizPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto mb-8 px-4 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Smart Matching</p>
        <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">Match Quiz</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Answer five short questions and BuyerHQ will surface verified specialists aligned to your location and
          buying priorities.
        </p>
      </div>
      <QuizContent />
    </div>
  );
}
