import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Clock, MapPin, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPay } from "@/lib/localstep/jobs";
import { getOpportunityMatch, profileHasData } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import { VerifiedBadge } from "./verified-badge";
import type { Job } from "@/lib/localstep/types";
import { formatDistance, getOpportunityDistance } from "@/lib/localstep/geo";

const opportunityLabels = {
  job: "Job",
  internship: "Internship",
  volunteer: "Volunteering",
  scholarship: "Scholarship",
  college_program: "College Program",
  competition: "Competition",
} as const;

export function JobMetaRow({ job }: { job: Job }) {
  const { profile } = useLocalStep();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <MapPin className="h-4 w-4" aria-hidden="true" />
        {job.location} · {formatDistance(getOpportunityDistance(profile, job))}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Wallet className="h-4 w-4" aria-hidden="true" />
        {formatPay(job)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-4 w-4" aria-hidden="true" />
        {job.schedule}
      </span>
    </div>
  );
}

export function JobCard({ job, showSave = true }: { job: Job; showSave?: boolean }) {
  const { account, isSaved, toggleSaved, hasApplied, hydrated, profile, getBusinessProfile } =
    useLocalStep();
  const saved = hydrated && isSaved(job.id);
  const applied = hydrated && hasApplied(job.id);
  const hasProfile = profileHasData(profile);
  const match = hasProfile ? getOpportunityMatch(profile, job) : null;
  const businessProfile = getBusinessProfile(job.employer);

  return (
    <article className="group relative rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ink">
              <Link
                to="/jobs/$jobId"
                params={{ jobId: job.id }}
                className="after:absolute after:inset-0 after:content-[''] hover:text-primary"
              >
                {job.title}
              </Link>
            </h3>
            {job.featured ? (
              <Badge className="border-transparent bg-accent text-accent-foreground hover:bg-accent">
                Featured
              </Badge>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {businessProfile ? (
              <Link
                to="/employers/$employerId"
                params={{ employerId: businessProfile.slug }}
                className="relative z-10 hover:text-primary"
              >
                {job.employer}
              </Link>
            ) : (
              <span>{job.employer}</span>
            )}
            {businessProfile?.verificationStatus === "approved" ? <VerifiedBadge /> : null}
          </div>
        </div>
        {showSave ? (
          account ? (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-pressed={saved}
              aria-label={saved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
              className="relative z-10 shrink-0 text-muted-foreground hover:text-primary"
              onClick={() => toggleSaved(job.id)}
            >
              {saved ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="relative z-10 shrink-0 text-muted-foreground"
              aria-label="Sign in to save this opportunity"
            >
              <Link to="/auth" search={{ mode: "signin" }}>
                <Bookmark className="mr-1.5 h-4 w-4" /> Sign in to save
              </Link>
            </Button>
          )
        ) : null}
      </div>

      <div className="mt-3">
        <JobMetaRow job={job} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className="border-primary/20 bg-accent text-accent-foreground">
          {opportunityLabels[job.opportunityType ?? "job"]}
        </Badge>
        {job.deadline ? (
          <Badge variant="secondary">Apply by {new Date(job.deadline).toLocaleDateString()}</Badge>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{job.summary}</p>

      {match ? (
        <div className="mt-4 rounded-lg border border-border bg-surface-sunken p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-ink">{match.score}% Match</p>
              <p className="text-xs text-muted-foreground">{match.label}</p>
            </div>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {match.reasons.slice(0, 3).map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : hydrated && !hasProfile ? (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-sunken p-3 text-sm text-muted-foreground">
          Complete your profile to unlock personalized matches.
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-medium">
          {job.employmentType}
        </Badge>
        <Badge variant="secondary" className="font-medium">
          {job.experience}
        </Badge>
        <Badge variant="secondary" className="font-medium">
          Ages {job.minimumAge}+
        </Badge>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Posted {job.postedDaysAgo}d ago{job.demo ? " · Sample listing (not a real job)" : ""}
        </span>
        <span className="relative z-10 flex gap-2">
          {applied ? (
            <Button asChild size="sm">
              <Link to="/applications">Application Submitted</Link>
            </Button>
          ) : job.active === false ? (
            <Button size="sm" disabled>
              Applications closed
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/apply/$jobId" params={{ jobId: job.id }}>
                Apply Now
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
              View
            </Link>
          </Button>
        </span>
      </div>
    </article>
  );
}
