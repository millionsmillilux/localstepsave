import { HirePricing } from "@/components/localstep/hire-pricing";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Container, SectionHeading, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/employers")({
  head: () => ({
    meta: [
      { title: "Hire local students, pay per hire | LocalStep" },
      {
        name: "description",
        content:
          "Post a student-friendly job and reach local high school and college students who are actively looking for their next opportunity.",
      },
      { property: "og:title", content: "Hire local students, pay per hire | LocalStep" },
      { property: "og:description", content: "Reach local students who are actively looking for their next opportunity." },
    ],
  }),
  component: EmployersPage,
});

const steps = [
  { title: "Create a job listing", body: "Describe the role, the schedule, and the experience level you actually need." },
  { title: "Reach students nearby", body: "Your listing shows up for students filtering by distance from home or school." },
  { title: "Highlight student-friendly details", body: "Age minimums, training provided, and shift times are shown up front." },
  { title: "Manage applicants", body: "Review applications in one place from your employer dashboard." },
];



function EmployersPage() {
  return (
    <SitePage>
      <section className="border-b border-border bg-surface">
        <Container className="grid gap-10 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">For employers</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Need your next great part-time hire?
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              Reach local students who are actively looking for their next opportunity. Listings are built around the
              details students care about: distance, schedule, age and experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/employer/jobs/new">Post a Job</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/employer">See the dashboard</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Posting is free. You only pay a one-time fee when you hire a student through LocalStep.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-sunken p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Employer dashboard</p>
              <Badge variant="secondary">Sample preview, not real data</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Applicants", value: "17" },
                { label: "Job views", value: "482" },
                { label: "Applications", value: "17" },
                { label: "Active listings", value: "2" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-xl font-semibold text-ink">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="How it works" title="Post once, reach students nearby." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {steps.map((step) => (
              <div key={step.title} className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="Post for free. Pay only when you hire."
            description="LocalStep is commission-based: listings cost nothing, and you pay a one-time fee only for each successful hire."
            align="center"
          />
          <HirePricing />
        </Container>
      </section>
    </SitePage>
  );
}
