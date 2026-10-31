import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Clock, MapPin, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPay } from "@/lib/localstep/jobs";
import { getOpportunityMatch, profileHasData } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import type { Job } from "@/lib/localstep/types";

export function JobMetaRow({ job }: { job: Job }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <MapPin className="h-4 w-4" aria-hidden="true" />
        {job.location} · {job.distanceMiles} mi away
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
  const { isSaved, toggleSaved, hydrated, profile } = useLocalStep();
  const saved = hydrated && isSaved(job.id);
  const hasProfile = profileHasData(profile);
  const match = hasProfile ? getOpportunityMatch(profile, job) : null;

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
              <Badge className="border-transparent bg-accent text-accent-foreground hover:bg-accent">Featured</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{job.employer}</p>
        </div>
        {showSave ? (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-pressed={saved}
            aria-label={saved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
            className="relative z-10 shrink-0 text-muted-foreground hover:text-primary"
            onClick={() => toggleSaved(job.id)}
          >
            {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        ) : null}
      </div>

      <div className="mt-3">
        <JobMetaRow job={job} />
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
      ) : (
        hydrated && !hasProfile ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-sunken p-3 text-sm text-muted-foreground">
            Complete your profile to unlock personalized matches.
          </div>
        ) : null
      )}

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
        <span className="text-xs text-muted-foreground">Posted {job.postedDaysAgo}d ago · Demo listing</span>
        <span className="relative z-10">
          <Button asChild variant="outline" size="sm">
            <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
              View Opportunity
            </Link>
          </Button>
        </span>
      </div>
    </article>
  );
}
