import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, CalendarDays, CheckCircle2, MessageSquare, UserRound } from "lucide-react";

import { Container, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./applications";
import { useLocalStep } from "@/lib/localstep/store";
import { VerifiedBadge } from "@/components/localstep/verified-badge";

export const Route = createFileRoute("/_authenticated/applications/$applicationId")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Application details | LocalStep" }] }),
  component: ApplicationDetailPage,
});

function ApplicationDetailPage() {
  const { applicationId } = Route.useParams();
  const { applications, allJobs, hydrated, withdrawApplication, getBusinessProfile } = useLocalStep();
  const application = applications.find((item) => item.id === applicationId);
  const job = application ? allJobs.find((item) => item.id === application.jobId) : undefined;
  if (!hydrated) return null;
  if (!application || !job) return <SitePage><Container className="py-24 text-center"><h1 className="text-2xl font-semibold text-ink">Application not found</h1><Button asChild className="mt-6"><Link to="/applications">Back to My Applications</Link></Button></Container></SitePage>;
  const businessProfile = getBusinessProfile(job.employer);
  return <SitePage><Container className="max-w-3xl py-10">
    <Link to="/applications" className="text-sm text-muted-foreground hover:text-primary">← My Applications</Link>
    <div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight text-ink">{job.title}</h1><p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">{businessProfile ? <Link to="/employers/$employerId" params={{ employerId: businessProfile.slug }} className="hover:text-primary">{job.employer}</Link> : <span>{job.employer}</span>}{businessProfile?.verificationStatus === "approved" ? <VerifiedBadge /> : null} · {job.location}</p><Button asChild variant="link" className="mt-2 h-auto p-0 text-sm"><Link to="/jobs/$jobId" params={{ jobId: job.id }}>View opportunity</Link></Button></div><StatusBadge status={application.status} /></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Match Score</p><p className="mt-1 text-2xl font-semibold text-primary">{application.matchScoreAtSubmission}%</p></div><div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Applied</p><p className="mt-1 text-sm font-semibold text-ink">{new Date(application.submittedAt).toLocaleDateString()}</p></div><div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</p><p className="mt-1 text-sm font-semibold text-ink">{job.deadline ?? "Open applications"}</p></div></div>
    <section className="mt-10"><h2 className="text-lg font-semibold text-ink">Application Timeline</h2><div className="mt-5 space-y-3">{application.events.map((event, index) => <div key={event.id}><div className="flex gap-3 rounded-xl border border-border bg-surface p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /><div><p className="text-sm font-medium text-ink">{event.label}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleDateString()}</p></div></div>{index < application.events.length - 1 ? <ArrowDown className="mx-auto my-1 h-4 w-4 text-muted-foreground" /> : null}</div>)}</div></section>
    <section className="mt-10 rounded-xl border border-border bg-surface p-5"><h2 className="text-base font-semibold text-ink">What you sent</h2><div className="mt-4 space-y-4 text-sm"><p><UserRound className="mr-2 inline h-4 w-4 text-muted-foreground" /><strong>{application.profileSnapshot.name}</strong> · {application.profileSnapshot.school} · Class of {application.profileSnapshot.graduationYear}</p><p><MessageSquare className="mr-2 inline h-4 w-4 text-muted-foreground" />{application.message || "No message added."}</p>{application.interviewDate ? <p><CalendarDays className="mr-2 inline h-4 w-4 text-muted-foreground" />Interview: {application.interviewDate}</p> : null}</div></section>
    {application.status !== "Withdrawn" && application.status !== "Accepted" && application.status !== "Not Selected" ? <Button variant="ghost" className="mt-5 text-muted-foreground" onClick={() => withdrawApplication(application.id)}>Withdraw application</Button> : null}
  </Container></SitePage>;
}
