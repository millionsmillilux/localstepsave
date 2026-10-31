import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText, MapPin } from "lucide-react";

import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStep } from "@/lib/localstep/store";
import type { ApplicationStatus } from "@/lib/localstep/types";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({ meta: [{ title: "My Applications | LocalStep" }] }),
  component: ApplicationsPage,
});

const statusStyles: Record<ApplicationStatus, string> = {
  Submitted: "bg-accent text-accent-foreground",
  Viewed: "bg-blue-100 text-blue-800",
  "Under Review": "bg-amber-100 text-amber-800",
  Interview: "bg-violet-100 text-violet-800",
  Offer: "bg-emerald-100 text-emerald-800",
  Accepted: "bg-success/15 text-success",
  "Not Selected": "bg-secondary text-muted-foreground",
  Withdrawn: "bg-secondary text-muted-foreground",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge className={`border-transparent hover:opacity-90 ${statusStyles[status]}`}>{status}</Badge>;
}

function ApplicationsPage() {
  const { applications, allJobs, hydrated } = useLocalStep();
  return <SitePage><Container className="py-10">
    <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">My Applications</h1>
    <p className="mt-2 text-sm text-muted-foreground">Track every opportunity you've sent through LocalStep.</p>
    <div className="mt-8">{!hydrated || applications.length === 0 ? <EmptyState icon={<FileText className="mx-auto h-6 w-6" />} title="No applications yet" description="Find an opportunity that fits you and take your next step." action={<Button asChild><Link to="/jobs">Find Opportunities</Link></Button>} /> : <ul className="grid gap-4 lg:grid-cols-2">{applications.map((application) => {
      const job = allJobs.find((item) => item.id === application.jobId);
      if (!job) return null;
      return <li key={application.id} className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"><div className="flex items-start justify-between gap-3"><div><Link to="/applications/$applicationId" params={{ applicationId: application.id }} className="text-base font-semibold text-ink hover:text-primary">{job.title}</Link><p className="mt-1 text-sm font-medium text-muted-foreground">{job.employer}</p></div><StatusBadge status={application.status} /></div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><span><MapPin className="mr-1 inline h-3.5 w-3.5" />{job.location}</span><span>Applied {new Date(application.submittedAt).toLocaleDateString()}</span><span>{application.matchScoreAtSubmission}% Match</span></div><div className="mt-4 flex items-center justify-between"><span className="text-xs text-muted-foreground">{application.events.length} timeline event{application.events.length === 1 ? "" : "s"}</span><Button asChild size="sm" variant="outline"><Link to="/applications/$applicationId" params={{ applicationId: application.id }}>View Application</Link></Button></div></li>;
    })}</ul>}</div>
  </Container></SitePage>;
}
