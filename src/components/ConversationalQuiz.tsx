"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const labelMap: Record<string, Record<string, string>> = {
  goal: {
    firsthome: "First Home Buyer",
    upsize: "Upsize / Change Home",
    invest: "Investment Property",
    luxury: "Luxury / Prestige",
  },
  state: {
    NSW: "New South Wales",
    VIC: "Victoria",
    QLD: "Queensland",
    WA: "Western Australia",
    SA: "South Australia",
    TAS: "Tasmania",
    ACT: "Australian Capital Territory",
    NT: "Northern Territory",
  },
};

const goalToSpecialization: Record<string, string> = {
  firsthome: "First Home Buyers",
  invest: "Investment Strategy",
  luxury: "Luxury",
  upsize: "Negotiation",
};

const helpToSpecialization: Record<string, string> = {
  auction: "Auction Bidding",
  offmarket: "Off-Market Access",
  negotiate: "Negotiation",
};

const questions = [
  {
    id: "goal",
    botMessage: "What's your primary property goal?",
    options: [
      { value: "firsthome", label: "Buy my first home" },
      { value: "upsize", label: "Upsize or change home" },
      { value: "invest", label: "Investment property" },
      { value: "luxury", label: "Luxury or prestige" },
    ],
  },
  {
    id: "budget",
    botMessage: "Great choice. What's your approximate budget?",
    options: [
      { value: "under500", label: "Under $500K" },
      { value: "500to800", label: "$500K - $800K" },
      { value: "800to1.5m", label: "$800K - $1.5M" },
      { value: "over1.5m", label: "Over $1.5M" },
    ],
  },
  {
    id: "state",
    botMessage: "Which state are you buying in?",
    options: [
      { value: "NSW", label: "NSW - New South Wales" },
      { value: "VIC", label: "VIC - Victoria" },
      { value: "QLD", label: "QLD - Queensland" },
      { value: "WA", label: "WA - Western Australia" },
      { value: "SA", label: "SA - South Australia" },
      { value: "TAS", label: "TAS - Tasmania" },
      { value: "ACT", label: "ACT - Capital Territory" },
      { value: "NT", label: "NT - Northern Territory" },
    ],
  },
  {
    id: "timeline",
    botMessage: "How soon are you looking to purchase?",
    options: [
      { value: "asap", label: "As soon as possible" },
      { value: "3months", label: "Within 3 months" },
      { value: "6months", label: "3-6 months" },
      { value: "exploring", label: "Just exploring" },
    ],
  },
  {
    id: "help",
    botMessage: "Last one - what do you need most help with?",
    options: [
      { value: "search", label: "Property search and shortlisting" },
      { value: "auction", label: "Auction bidding" },
      { value: "negotiate", label: "Negotiation strategy" },
      { value: "offmarket", label: "Off-market access" },
    ],
  },
];

type Message = {
  type: "bot" | "user";
  text: string;
  questionId?: string;
  options?: Array<{ value: string; label: string }>;
  answered?: boolean;
};

function buildSearchParams(answers: Record<string, string>) {
  const params = new URLSearchParams();
  if (answers.state) params.set("state", answers.state);
  if (answers.goal && goalToSpecialization[answers.goal]) {
    params.set("specialization", goalToSpecialization[answers.goal]);
  }
  if (answers.help && helpToSpecialization[answers.help]) {
    params.set("specialization", helpToSpecialization[answers.help]);
  }
  return params.toString();
}

export function ConversationalQuiz() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addBotMessage = (index: number) => {
    const q = questions[index];
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: q.botMessage,
        questionId: q.id,
        options: q.options,
        answered: false,
      },
    ]);
  };

  const handleStart = () => {
    setStarted(true);
    setCurrentStep(0);
    setTimeout(() => addBotMessage(0), 300);
  };

  const handleAnswer = (questionId: string, value: string, label: string) => {
    setMessages((prev) => prev.map((item) => (item.questionId === questionId ? { ...item, answered: true } : item)));
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "user", text: label }]);
    }, 120);

    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);

    const nextStep = currentStep + 1;
    if (nextStep < questions.length) {
      setCurrentStep(nextStep);
      setTimeout(() => addBotMessage(nextStep), 650);
      return;
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Your match is ready. I found agents aligned to your location and priorities.",
        },
      ]);
      setComplete(true);
    }, 800);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy font-display text-2xl font-bold text-white">
          5
        </div>
        <div>
          <h2 className="mb-2 font-display text-2xl font-bold text-navy">Find your ideal agent in 5 questions</h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            Answer a few quick questions and we&apos;ll shortlist verified buyer&apos;s agents for your exact situation.
          </p>
        </div>
        <button
          onClick={handleStart}
          className="inline-flex items-center rounded-md bg-navy px-5 py-3 font-semibold text-white transition-colors hover:bg-navy-mid"
        >
          Start Matching <ArrowRight className="ml-2 h-4 w-4" />
        </button>
        <p className="text-xs text-muted-foreground">Free for buyers - no sign-up required</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-[360px] flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((message, index) => (
          <div key={index} className={cn("flex gap-3", message.type === "user" ? "flex-row-reverse" : "flex-row")}>
            {message.type === "bot" ? (
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                B
              </div>
            ) : null}

            <div className={cn("flex max-w-[80%] flex-col gap-2", message.type === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.type === "bot"
                    ? "rounded-tl-sm bg-muted text-foreground"
                    : "rounded-tr-sm bg-navy text-white"
                )}
              >
                {message.text}
              </div>

              {message.type === "bot" && message.options && !message.answered ? (
                <div className={cn("grid w-full gap-2", message.options.length > 4 ? "grid-cols-2" : "grid-cols-1")}>
                  {message.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(message.questionId!, option.value, option.label)}
                      className="rounded-xl border-2 border-border bg-card px-3.5 py-2.5 text-left text-sm font-medium text-foreground transition-all hover:border-navy hover:bg-navy/5"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {complete ? (
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-white">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
              <p className="mb-3 text-sm text-foreground">
                Based on your answers, I found matched agents in{" "}
                <strong>{labelMap.state[answers.state] ?? answers.state}</strong> aligned to{" "}
                <strong>{labelMap.goal[answers.goal] ?? answers.goal}</strong>.
              </p>
              <Link
                href={`/find-agents?${buildSearchParams(answers)}`}
                className="inline-flex w-full items-center justify-center rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-mid"
              >
                View My Matched Agents <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      {started && !complete ? (
        <div className="flex items-center justify-center gap-1.5 border-t border-border pt-4">
          {questions.map((_, index) => (
            <div
              key={index}
              className={cn(
                "rounded-full transition-all duration-300",
                index < currentStep ? "h-2 w-2 bg-navy" : index === currentStep ? "h-2 w-4 bg-navy" : "h-2 w-2 bg-muted"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
