import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, CircleCheck } from "lucide-react";
import { useState } from "react";

import { Container, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics/ga";
import { logJobEvent } from "@/lib/localstep/analytics";
import { formatPay } from "@/lib/localstep/jobs";
import { useLocalStep } from "@/lib/localstep/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply/$jobId")({
  head: () => ({
    meta: [
      { title: "Apply to an opportunity | LocalStep" },
      { name: "description", content: "A short, three-step application built for students." },
      { property: "og:title", content: "Apply to an opportunity | LocalStep" },
      { property: "og:description", content: "A short, three-step application built for students." },
    ],
  }),
  component: ApplyPage,
});

const stepLabels = ["Confirm profile", "Review application", "Submit"];

function ApplyPage() {
  const { jobId } = Route.useParams();
  const { allJobs, profile, updateProfile, addApplication, hydrated } = useLocalStep();
  const job = allJobs.find((item) => item.id === jobId);
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!job) {
    return (
      <SitePage>
        <Container className="py-24 text-center">
          <h1 className="text-2xl font-semibold text-ink">We couldn't find that opportunity</h1>
          <Button asChild className="mt-6">
            <Link to="/jobs">Browse Opportunities</Link>
          </Button>
        </Container>
      </SitePage>
    );
  }

  if (submitted) {
    return (
      <SitePage>
        <Container className="max-w-xl py-20 text-center">
          <CircleCheck className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Application sent</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your application has been submitted to {job.employer}.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/applications">View My Applications</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/jobs">Find More Opportunities</Link>
            </Button>
          </div>
        </Container>
      </SitePage>
    );
  }

  return (
    <SitePage>
      <Container className="max-w-3xl py-10">
        <p className="text-sm text-muted-foreground">Applying to</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{job.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {job.employer} · {job.location} · {formatPay(job)}
        </p>

        <ol className="mt-8 flex items-center gap-3" aria-label="Application steps">
          {stepLabels.map((label, index) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  index < step
                    ? "border-success bg-success text-success-foreground"
                    : index === step
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground",
                )}
              >
                {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  index === step ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          {step === 0 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-ink">Confirm your profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Employers only see what's below. We never ask students for sensitive personal information.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="apply-name">Name</Label>
                  <Input
                    id="apply-name"
                    className="mt-1.5"
                    value={profile.name}
                    onChange={(event) => updateProfile({ name: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="apply-school">School</Label>
                  <Input
                    id="apply-school"
                    className="mt-1.5"
                    value={profile.school}
                    onChange={(event) => updateProfile({ school: event.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="apply-note">Why you're interested (optional)</Label>
                <Textarea
                  id="apply-note"
                  className="mt-1.5"
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="A sentence or two is plenty."
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-ink">Review your application</h2>
              <dl className="divide-y divide-border rounded-lg border border-border">
                {[
                  { label: "Name", value: profile.name || "Not provided" },
                  { label: "School", value: profile.school || "Not provided" },
                  { label: "Graduation year", value: profile.graduationYear || "Not provided" },
                  { label: "Skills", value: profile.skills.join(", ") || "Not provided" },
                  { label: "Availability", value: profile.availability.join(", ") || "Not provided" },
                  { label: "Note", value: note || "No note added" },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between">
                    <dt className="text-sm text-muted-foreground">{row.label}</dt>
                    <dd className="text-sm font-medium text-ink sm:text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-muted-foreground">
                Need to change something else?{" "}
                <Link to="/profile" className="text-primary hover:underline">
                  Edit your profile
                </Link>
                .
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-ink">Ready to submit</h2>
              <p className="text-sm text-muted-foreground">
                We'll send your profile and note to {job.employer}. You can withdraw at any time by contacting them
                directly.
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? undefined : setStep(step - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !profile.name.trim()}>
                Continue
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (hydrated) addApplication(job.id);
                  void logJobEvent(job, "application");
                  trackEvent("job_application", {
                    job_id: job.id,
                    job_title: job.title,
                    employer: job.employer,
                  });
                  setSubmitted(true);
                }}
              >
                Submit application
              </Button>
            )}
          </div>
        </div>
      </Container>
    </SitePage>
  );
}
