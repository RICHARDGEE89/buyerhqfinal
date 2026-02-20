"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";

const stateRates: Record<string, { rate: number; fhbLimit: number }> = {
  NSW: { rate: 0.045, fhbLimit: 650000 },
  VIC: { rate: 0.055, fhbLimit: 600000 },
  QLD: { rate: 0.042, fhbLimit: 500000 },
  WA: { rate: 0.039, fhbLimit: 430000 },
  SA: { rate: 0.050, fhbLimit: 0 },
  TAS: { rate: 0.040, fhbLimit: 0 },
  ACT: { rate: 0.038, fhbLimit: 0 },
  NT: { rate: 0.049, fhbLimit: 0 },
};

function currency(value: number) {
  return `$${Math.max(0, Math.round(value)).toLocaleString()}`;
}

export default function ToolsContent() {
  const [active, setActive] = useState<"borrow" | "repay" | "stamp">("borrow");

  const [income, setIncome] = useState(140000);
  const [expenses, setExpenses] = useState(3200);
  const [deposit, setDeposit] = useState(150000);
  const [borrowRate, setBorrowRate] = useState(6.2);
  const [borrowTerm, setBorrowTerm] = useState(30);

  const [loanAmount, setLoanAmount] = useState(750000);
  const [repayRate, setRepayRate] = useState(6.2);
  const [repayTerm, setRepayTerm] = useState(30);

  const [stampState, setStampState] = useState("NSW");
  const [stampPrice, setStampPrice] = useState(900000);
  const [firstHome, setFirstHome] = useState(false);

  const borrowing = useMemo(() => {
    const monthlyIncome = income / 12;
    const monthlyCapacity = Math.max(0, monthlyIncome * 0.35 - expenses);
    const monthlyRate = (borrowRate / 100 + 0.03) / 12;
    const months = borrowTerm * 12;
    if (monthlyRate <= 0 || months <= 0 || monthlyCapacity <= 0) {
      return { maxLoan: 0, maxPurchase: deposit };
    }
    const maxLoan =
      (monthlyCapacity * (Math.pow(1 + monthlyRate, months) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, months));
    return {
      maxLoan,
      maxPurchase: maxLoan + deposit,
    };
  }, [borrowRate, borrowTerm, deposit, expenses, income]);

  const repayment = useMemo(() => {
    const monthlyRate = repayRate / 100 / 12;
    const months = repayTerm * 12;
    if (months <= 0 || loanAmount <= 0) return { monthly: 0, weekly: 0, totalInterest: 0 };
    if (monthlyRate <= 0) {
      const monthly = loanAmount / months;
      return { monthly, weekly: monthly / (52 / 12), totalInterest: 0 };
    }

    const monthly =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalRepaid = monthly * months;
    return {
      monthly,
      weekly: monthly / (52 / 12),
      totalInterest: totalRepaid - loanAmount,
    };
  }, [loanAmount, repayRate, repayTerm]);

  const stampDuty = useMemo(() => {
    const config = stateRates[stampState] ?? stateRates.NSW;
    const base = stampPrice * config.rate;
    const exemption = firstHome && config.fhbLimit > 0 && stampPrice <= config.fhbLimit;
    const duty = exemption ? 0 : base;
    return {
      duty,
      exemption,
    };
  }, [firstHome, stampPrice, stampState]);

  return (
    <div className="py-12">
      <div
        className="bg-navy px-4 py-14"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Buyer Utilities</p>
          <h1 className="font-display text-4xl font-bold text-white">Calculator Suite</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
            Estimate borrowing power, repayments, and stamp duty before you shortlist agents.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5 flex flex-wrap gap-2 rounded-lg border border-border bg-card p-3 shadow-card">
          <button
            onClick={() => setActive("borrow")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active === "borrow" ? "bg-navy text-white" : "text-foreground hover:bg-muted"
            }`}
          >
            Borrowing Power
          </button>
          <button
            onClick={() => setActive("repay")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active === "repay" ? "bg-navy text-white" : "text-foreground hover:bg-muted"
            }`}
          >
            Repayments
          </button>
          <button
            onClick={() => setActive("stamp")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active === "stamp" ? "bg-navy text-white" : "text-foreground hover:bg-muted"
            }`}
          >
            Stamp Duty
          </button>
        </div>

        {active === "borrow" ? (
          <section className="grid gap-5 rounded-lg border border-border bg-card p-6 shadow-card lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                Annual household income
                <input
                  type="number"
                  value={income}
                  onChange={(event) => setIncome(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-semibold text-foreground">
                Monthly living expenses
                <input
                  type="number"
                  value={expenses}
                  onChange={(event) => setExpenses(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-semibold text-foreground">
                Deposit available
                <input
                  type="number"
                  value={deposit}
                  onChange={(event) => setDeposit(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-semibold text-foreground">
                Interest rate (%)
                <input
                  type="number"
                  step="0.1"
                  value={borrowRate}
                  onChange={(event) => setBorrowRate(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-semibold text-foreground">
                Loan term (years)
                <input
                  type="number"
                  value={borrowTerm}
                  onChange={(event) => setBorrowTerm(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Estimated capacity</p>
              <p className="mt-2 font-display text-4xl font-bold text-navy">{currency(borrowing.maxLoan)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Indicative maximum loan amount</p>
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated loan</span>
                  <span className="font-semibold text-foreground">{currency(borrowing.maxLoan)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="font-semibold text-foreground">{currency(deposit)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Indicative max purchase</span>
                  <span className="font-semibold text-foreground">{currency(borrowing.maxPurchase)}</span>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {active === "repay" ? (
          <section className="grid gap-5 rounded-lg border border-border bg-card p-6 shadow-card lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                Loan amount
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(event) => setLoanAmount(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-semibold text-foreground">
                Interest rate (%)
                <input
                  type="number"
                  step="0.1"
                  value={repayRate}
                  onChange={(event) => setRepayRate(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-semibold text-foreground">
                Loan term (years)
                <input
                  type="number"
                  value={repayTerm}
                  onChange={(event) => setRepayTerm(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Repayment estimate</p>
              <p className="mt-2 font-display text-4xl font-bold text-navy">{currency(repayment.monthly)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Monthly principal &amp; interest</p>
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weekly repayment</span>
                  <span className="font-semibold text-foreground">{currency(repayment.weekly)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total interest</span>
                  <span className="font-semibold text-foreground">{currency(repayment.totalInterest)}</span>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {active === "stamp" ? (
          <section className="grid gap-5 rounded-lg border border-border bg-card p-6 shadow-card lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                State
                <select
                  value={stampState}
                  onChange={(event) => setStampState(event.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.keys(stateRates).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-foreground">
                Purchase price
                <input
                  type="number"
                  value={stampPrice}
                  onChange={(event) => setStampPrice(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={firstHome}
                  onChange={(event) => setFirstHome(event.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                First home buyer
              </label>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Indicative stamp duty</p>
              <p className="mt-2 font-display text-4xl font-bold text-navy">{currency(stampDuty.duty)}</p>
              {stampDuty.exemption ? (
                <p className="mt-1 text-sm font-semibold text-foreground">First-home concession applied at this price.</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Estimate uses state-level baseline rates and may differ from final assessed duty.
                </p>
              )}
            </div>
          </section>
        ) : null}

        <section className="mt-8 rounded-lg border border-border bg-muted/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Calculator className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="font-display text-lg font-bold text-navy">Ready to apply this to your search?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use your numbers to shortlist verified specialists and submit a brokered enquiry.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/find-agents"
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
              >
                Browse agents
              </Link>
              <Link
                href="/match-quiz"
                className="inline-flex items-center rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-mid"
              >
                Take match quiz <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
