import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Single source of truth for LocalStep's employer pricing. Update the fee here. */
export const HIRE_PRICING = {
  feeLabel: "One-time fee per hire",
  feeDetail: "Exact commission rate coming soon",
  note: "Posting is always free. You only pay when a student is hired through LocalStep. Billing is coming soon — no payments are processed yet.",
};

const steps = [
  { title: "Post for free", body: "Create as many student-friendly listings as you need at no cost." },
  { title: "Review applicants", body: "See applications from local students in your dashboard." },
  { title: "Mark a student as hired", body: "Move an application to Accepted when you make the hire." },
  { title: "Pay the hire fee", body: "A single commission for each successful hire. Nothing else." },
];

const included = ["Unlimited free job postings", "Applicant management dashboard", "Business profile", "No monthly subscription"];

export function HirePricing() {
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col rounded-xl border border-primary bg-surface p-6 shadow-[var(--shadow-raised)]">
        <h3 className="text-base font-semibold text-ink">Pay per successful hire</h3>
        <p className="mt-4 text-3xl font-semibold text-ink">$0 <span className="text-sm font-normal text-muted-foreground">to post</span></p>
        <p className="mt-2 text-sm font-medium text-ink">{HIRE_PRICING.feeLabel}</p>
        <p className="text-xs text-muted-foreground">{HIRE_PRICING.feeDetail}</p>
        <ul className="mt-6 flex-1 space-y-3">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-6">
          <Link to="/employer/jobs/new">Post a Job for Free</Link>
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">{HIRE_PRICING.note}</p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold text-primary">0{index + 1}</p>
            <h4 className="mt-2 text-sm font-semibold text-ink">{step.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
