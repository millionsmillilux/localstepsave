import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Crown, FileText, GraduationCap, Sparkles } from "lucide-react";
import { useState } from "react";

import { Container, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { seoHead } from "@/lib/seo";
import { useLocalStep } from "@/lib/localstep/store";

export const Route = createFileRoute("/premium")({
  staticData: { sitemap: true },
  head: () => ({
    ...seoHead({
      path: "/premium",
      title: "LocalStep Student Premium",
      description:
        "Upgrade to LocalStep Student Premium for a more complete profile, sharper matches, resume tools, and college-prep organization.",
    }),
  }),
  component: PremiumPage,
});

const features = [
  [
    "Personalized opportunity matches",
    "Top matches with clearer reasons and expanded recommendations",
  ],
  ["Enhanced student profile", "More space for career goals, portfolio highlights, and skills"],
  ["Resume toolkit", "Premium resume guidance, templates, and presentation tools"],
  [
    "College preparation organizer",
    "Keep application tasks, activities, deadlines, and achievements together",
  ],
  ["Profile presentation", "A polished Premium badge and stronger profile preview"],
];

function PremiumPage() {
  const { demoPremium, activateDemoPremium, resetDemoPremium } = useLocalStep();
  const navigate = useNavigate();
  const [step, setStep] = useState<"offer" | "checkout" | "confirmation">(
    demoPremium ? "confirmation" : "offer",
  );

  function completePurchase() {
    activateDemoPremium();
    setStep("confirmation");
  }

  return (
    <SitePage>
      <Container className="py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-accent via-surface to-surface p-7 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <Badge className="border-transparent bg-primary text-primary-foreground">
                  <Crown className="mr-1 h-3.5 w-3.5" /> Student Premium
                </Badge>
                <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
                  Make the next step easier to see.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  A one-time upgrade for a more complete student profile, sharper matches, resume
                  tools, and a calmer college-prep workspace.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-surface p-5 text-center shadow-[var(--shadow-card)]">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  One-time demo price
                </p>
                <p className="mt-2 text-4xl font-semibold text-ink">$9.99</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No subscription · simulated checkout
                </p>
              </div>
            </div>

            {step === "offer" ? <OfferStep onUpgrade={() => setStep("checkout")} /> : null}
            {step === "checkout" ? (
              <CheckoutStep onBack={() => setStep("offer")} onConfirm={completePurchase} />
            ) : null}
            {step === "confirmation" ? (
              <ConfirmationStep
                onContinue={() => void navigate({ to: "/dashboard" })}
                onReset={() => {
                  resetDemoPremium();
                  setStep("offer");
                }}
              />
            ) : null}
          </div>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  What changes
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">Free vs. Premium</h2>
              </div>
              <Badge variant="outline">Demo comparison</Badge>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="grid grid-cols-[1fr_90px_100px] border-b border-border bg-surface-sunken p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-[1fr_140px_160px]">
                <span>Feature</span>
                <span>Free</span>
                <span>Premium</span>
              </div>
              {features.map(([title, description]) => (
                <div
                  key={title}
                  className="grid grid-cols-[1fr_90px_100px] items-start gap-2 border-b border-border p-4 last:border-0 sm:grid-cols-[1fr_140px_160px]"
                >
                  <div>
                    <p className="font-medium text-ink">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Core</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    <Check className="h-4 w-4" /> Included
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              to="/profile"
              className="rounded-xl border border-border bg-surface p-5 hover:border-primary/40"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-ink">Profile studio</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add career goals and portfolio highlights.
              </p>
            </Link>
            <Link
              to="/resume"
              className="rounded-xl border border-border bg-surface p-5 hover:border-primary/40"
            >
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-ink">Resume toolkit</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Build, improve, and preview your resume.
              </p>
            </Link>
            <Link
              to="/my-steps"
              className="rounded-xl border border-border bg-surface p-5 hover:border-primary/40"
            >
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-ink">College prep</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Organize deadlines, activities, and achievements.
              </p>
            </Link>
          </section>
        </div>
      </Container>
    </SitePage>
  );
}

function OfferStep({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
      <p className="text-sm font-semibold text-ink">Your Premium upgrade includes</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {features.map(([title]) => (
          <div key={title} className="flex gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            {title}
          </div>
        ))}
      </div>
      <Button className="mt-6" size="lg" onClick={onUpgrade}>
        Upgrade for $9.99 one-time
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        This is a fictional demo purchase. No payment information is requested.
      </p>
    </div>
  );
}

function CheckoutStep({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  return (
    <div className="mt-8 rounded-2xl border border-primary/30 bg-surface p-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline">SIMULATED CHECKOUT</Badge>
        <span className="text-xs text-muted-foreground">No payment is processed</span>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-ink">Confirm your demo upgrade</h2>
      <div className="mt-5 rounded-xl bg-surface-sunken p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">LocalStep Student Premium</span>
          <span className="font-semibold text-ink">$9.99</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm">
          <span className="font-medium text-ink">Total today</span>
          <span className="font-semibold text-primary">$9.99</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Select confirm to simulate a successful one-time purchase. This demo stores only a local
        Premium flag for the current session.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm}>Confirm simulated purchase</Button>
      </div>
    </div>
  );
}

function ConfirmationStep({
  onContinue,
  onReset,
}: {
  onContinue: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-success/30 bg-success/5 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <Badge className="border-transparent bg-success text-success-foreground">
            PREMIUM ACTIVE
          </Badge>
          <h2 className="mt-1 text-xl font-semibold text-ink">Your demo upgrade is complete</h2>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Premium features are now enabled for this session. This is a simulated confirmation, not a
        receipt or payment record.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={onContinue}>Open my dashboard</Button>
        <Button variant="outline" onClick={onReset}>
          Reset demo Premium
        </Button>
      </div>
    </div>
  );
}
