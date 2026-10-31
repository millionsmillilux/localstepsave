import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarClock,
  Flag,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { Container, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/ga";
import { logJobEvent } from "@/lib/localstep/analytics";
import { formatPay } from "@/lib/localstep/jobs";
import { getOpportunityMatch, profileHasData } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import { VerifiedBadge } from "@/components/localstep/verified-badge";
import type { OpportunityReportReason } from "@/lib/localstep/types";

const opportunityLabels = {
  job: "Job",
  internship: "Internship",
  volunteer: "Volunteering",
  scholarship: "Scholarship",
  college_program: "College Program",
  competition: "Competition",
} as const;

export const Route = createFileRoute("/jobs/$jobId")({
  staticData: { sitemap: false },
  head: () => ({ ...seoHead({ path: "/jobs", title: "Opportunity Details | LocalStep", description: "See pay, schedule, requirements and how to apply for this student opportunity on LocalStep.", noindex: true }) }),
  component: JobDetailPage,
  notFoundComponent: JobNotFound,
});

function JobNotFound() {
  return (
    <SitePage>
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">We couldn't find that opportunity</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been removed or the link may be out of date.
        </p>
        <Button asChild className="mt-6">
          <Link to="/jobs">Browse Opportunities</Link>
        </Button>
      </Container>
    </SitePage>
  );
}

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const {
    account,
    allJobs,
    isSaved,
    toggleSaved,
    hasApplied,
    applications,
    hydrated,
    profile,
    getBusinessProfile,
    reportOpportunity,
  } = useLocalStep();
  const job = allJobs.find((item) => item.id === jobId);
  const navigate = useNavigate();
  const loggedRef = useRef<string | null>(null);
  const match = job && profileHasData(profile) ? getOpportunityMatch(profile, job) : null;

  useEffect(() => {
    if (!job || loggedRef.current === job.id) return;
    loggedRef.current = job.id;
    void logJobEvent(job, "view");
    if (!job.demo)
      void supabase.rpc("record_opportunity_metric", {
        p_opportunity_id: job.id,
        p_metric: "view",
      });
    trackEvent("job_view", { job_id: job.id, job_title: job.title, employer: job.employer });
  }, [job]);

  if (!job) {
    if (hydrated) return <JobNotFound />;
    throw notFound();
  }

  const saved = hydrated && isSaved(job.id);
  const applied = hydrated && hasApplied(job.id);
  const businessProfile = getBusinessProfile(job.employer);

  const facts = [
    { label: "Location", value: `${job.location} · ${job.distanceMiles} mi away` },
    { label: "Pay", value: formatPay(job) },
    { label: "Schedule", value: job.schedule },
    { label: "Employment type", value: job.employmentType },
    { label: "Age requirement", value: `Ages ${job.minimumAge}+` },
    { label: "Experience", value: job.experience },
  ];

  return (
    <SitePage>
      <div className="border-b border-border bg-surface">
        <Container className="py-8">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link to="/jobs" className="hover:text-primary">
              Find Jobs
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{job.title}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {job.title}
                </h1>
                <Badge variant="secondary">{opportunityLabels[job.opportunityType ?? "job"]}</Badge>
                {job.featured ? (
                  <Badge className="border-transparent bg-accent text-accent-foreground hover:bg-accent">
                    Featured
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1.5 flex items-center gap-2 text-base font-medium text-muted-foreground">
                {businessProfile ? (
                  <Link
                    to="/employers/$employerId"
                    params={{ employerId: businessProfile.slug }}
                    className="hover:text-primary"
                  >
                    {job.employer}
                  </Link>
                ) : (
                  <span>{job.employer}</span>
                )}
                {businessProfile?.verificationStatus === "approved" ? <VerifiedBadge /> : null}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {job.location} · {job.distanceMiles} mi away
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" aria-hidden="true" />
                  {formatPay(job)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  {job.schedule}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {match ? (
              <section className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-ink">
                      {match.score}% Match
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{match.label}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {match.reasons.map((reason) => (
                    <div
                      key={reason}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 text-success">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                <details className="mt-5 rounded-lg border border-border bg-surface-sunken p-3">
                  <summary className="cursor-pointer list-none text-sm font-medium text-ink">
                    How we calculated your match
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {Object.entries(match.breakdown).map(([label, value]) => {
                      if (label === "total") return null;
                      const displayLabel =
                        label === "age"
                          ? "Age"
                          : label === "location"
                            ? "Location"
                            : label === "availability"
                              ? "Availability"
                              : label === "interests"
                                ? "Interests"
                                : label === "experience"
                                  ? "Experience"
                                  : "Skills";
                      return (
                        <div key={label} className="flex items-center justify-between gap-3">
                          <span>{displayLabel}</span>
                          <span className="font-medium text-ink">{value}/20</span>
                        </div>
                      );
                    })}
                    <div className="mt-3 border-t border-border pt-2 text-sm font-medium text-ink">
                      Total: {match.breakdown.total}/100
                    </div>
                  </div>
                </details>
              </section>
            ) : job.active === false ? (
              <Button className="w-full" disabled>
                Applications closed
              </Button>
            ) : (
              <section className="rounded-xl border border-dashed border-border bg-surface p-5">
                <p className="text-lg font-semibold text-ink">
                  Complete your profile to unlock personalized matches
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tell us about your interests, availability, skills, and location so LocalStep can
                  find opportunities that fit you.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/profile">Complete My Profile</Link>
                </Button>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold text-ink">Why this matches you</h2>
              <div className="mt-3 space-y-2">
                {(
                  match?.reasons ?? ["Add your profile details to see why this role matches you."]
                ).map((reason) => (
                  <div
                    key={reason}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 text-success">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-ink">About the opportunity</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-ink">What you'll do</h2>
              <ul className="mt-3 space-y-2">
                {job.responsibilities.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-ink">What we're looking for</h2>
              <ul className="mt-3 space-y-2">
                {job.lookingFor.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-ink">Schedule</h2>
              <p className="mt-3 text-sm text-muted-foreground">{job.scheduleDetail}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-ink">Requirements</h2>
              <ul className="mt-3 space-y-2">
                {job.requirements.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
                    <ShieldCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <dl className="grid gap-4 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <details className="text-sm text-muted-foreground">
              <summary className="inline-flex cursor-pointer items-center gap-1.5 underline-offset-4 hover:text-destructive hover:underline">
                <Flag className="h-4 w-4" aria-hidden="true" />
                Report Opportunity
              </summary>
              <div className="mt-3 rounded-lg border border-border bg-surface p-4">
                {account ? (
                  <>
                    <p className="font-medium text-ink">What is wrong with this listing?</p>
                    {(
                      [
                        "Suspicious/scam",
                        "Incorrect information",
                        "No longer available",
                        "Inappropriate",
                      ] as OpportunityReportReason[]
                    ).map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        className="mt-2 block text-left hover:text-primary"
                        onClick={() => {
                          reportOpportunity(job.id, reason);
                          toast.success("Thanks — your report was submitted.");
                        }}
                      >
                        {reason}
                      </button>
                    ))}
                  </>
                ) : (
                  <button
                    type="button"
                    className="text-left text-primary hover:underline"
                    onClick={() => void navigate({ to: "/auth", search: { mode: "signin" } })}
                  >
                    Sign in to report this opportunity
                  </button>
                )}
              </div>
            </details>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {businessProfile ? (
                      <Link
                        to="/employers/$employerId"
                        params={{ employerId: businessProfile.slug }}
                        className="hover:text-primary"
                      >
                        {job.employer}
                      </Link>
                    ) : (
                      <span>{job.employer}</span>
                    )}
                    {businessProfile?.verificationStatus === "approved" ? <VerifiedBadge /> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{job.location}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{job.employerBlurb}</p>

              <div className="mt-5 space-y-2">
                {applied ? (
                  <Button asChild className="w-full">
                    <Link
                      to="/applications/$applicationId"
                      params={{
                        applicationId:
                          applications.find((application) => application.jobId === job.id)?.id ??
                          "",
                      }}
                    >
                      View Application
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/apply/$jobId" params={{ jobId: job.id }}>
                      Apply Now
                    </Link>
                  </Button>
                )}
                {account ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toggleSaved(job.id);
                      if (!job.demo)
                        void supabase
                          .rpc("record_opportunity_metric", {
                            p_opportunity_id: job.id,
                            p_metric: "save",
                          })
                          .then(({ error }) => {
                            if (error) toast.error("Could not update save metric.");
                          });
                    }}
                    aria-pressed={saved}
                  >
                    {saved ? (
                      <>
                        <BookmarkCheck className="mr-1.5 h-4 w-4" /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="mr-1.5 h-4 w-4" /> Save
                      </>
                    )}
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth" search={{ mode: "signin" }}>
                      Sign in to save
                    </Link>
                  </Button>
                )}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Review the opportunity details carefully and use LocalStep to keep your next steps
                organized.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </SitePage>
  );
}
