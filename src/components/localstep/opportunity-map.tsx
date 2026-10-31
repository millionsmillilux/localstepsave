import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance, getJobCoordinates, getOpportunityDistance } from "@/lib/localstep/geo";
import { formatPay } from "@/lib/localstep/jobs";
import { getOpportunityMatch, profileHasData } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import type { Job } from "@/lib/localstep/types";
import { VerifiedBadge } from "./verified-badge";

export function OpportunityMap({ jobs }: { jobs: Job[] }) {
  const { profile, getBusinessProfile } = useLocalStep();
  const mappedJobs = jobs.filter((job) => getJobCoordinates(job));
  const [selectedId, setSelectedId] = useState<string | null>(mappedJobs[0]?.id ?? null);
  const selected = mappedJobs.find((job) => job.id === selectedId) ?? mappedJobs[0];
  const coordinates = mappedJobs.map((job) => getJobCoordinates(job)!);
  const minLat = Math.min(...coordinates.map((item) => item.latitude));
  const maxLat = Math.max(...coordinates.map((item) => item.latitude));
  const minLng = Math.min(...coordinates.map((item) => item.longitude));
  const maxLng = Math.max(...coordinates.map((item) => item.longitude));
  const latRange = Math.max(maxLat - minLat, 0.02);
  const lngRange = Math.max(maxLng - minLng, 0.02);
  const match = selected && profileHasData(profile) ? getOpportunityMatch(profile, selected) : null;
  const businessProfile = selected ? getBusinessProfile(selected.employer) : undefined;

  if (!mappedJobs.length) {
    return <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">Map coordinates aren&apos;t available for these opportunities yet. Try List View for full location details.</div>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[#e9f0e9] shadow-[var(--shadow-card)]">
      <div className="relative h-[520px] overflow-hidden bg-[linear-gradient(30deg,transparent_48%,rgba(255,255,255,.72)_49%,rgba(255,255,255,.72)_51%,transparent_52%),linear-gradient(120deg,transparent_48%,rgba(255,255,255,.6)_49%,rgba(255,255,255,.6)_51%,transparent_52%)] bg-[length:150px_150px] sm:h-[600px]">
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(#adc5ad_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute left-[8%] top-[12%] text-xs font-medium text-muted-foreground/70">LOCAL OPPORTUNITIES</div>
        {mappedJobs.map((job) => {
          const point = getJobCoordinates(job)!;
          const left = `${((point.longitude - minLng) / lngRange) * 78 + 11}%`;
          const top = `${((maxLat - point.latitude) / latRange) * 72 + 12}%`;
          return (
            <button
              key={job.id}
              type="button"
              aria-label={`View ${job.title} at ${job.employer}`}
              onClick={() => setSelectedId(job.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-transform hover:scale-110"
              style={{ left, top }}
            >
              <MapPin className="h-5 w-5 fill-current" aria-hidden="true" />
            </button>
          );
        })}
        {selected ? (
          <div className="absolute bottom-4 left-4 right-4 z-20 max-w-sm rounded-xl border border-border bg-surface p-4 shadow-lg sm:bottom-6 sm:left-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-ink">{selected.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{selected.employer} {businessProfile?.verificationStatus === "approved" ? <VerifiedBadge /> : null}</p>
              </div>
              <Badge className="shrink-0 bg-accent text-accent-foreground">{formatPay(selected)}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{formatDistance(getOpportunityDistance(profile, selected))}</span>
              {match ? <span className="font-semibold text-primary">{match.score}% Match</span> : null}
            </div>
            <Button asChild size="sm" className="mt-3 w-full"><Link to="/jobs/$jobId" params={{ jobId: selected.id }}>View Opportunity</Link></Button>
          </div>
        ) : null}
      </div>
      <div className="border-t border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        {mappedJobs.length} active {mappedJobs.length === 1 ? "opportunity" : "opportunities"} shown · Pins use business locations
      </div>
    </div>
  );
}
