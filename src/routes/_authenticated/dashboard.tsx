import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Bookmark, CheckCircle2, FileText, ListChecks, Sparkles } from "lucide-react";

import { JobCard } from "@/components/localstep/job-card";
import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getRecommendedJobs } from "@/lib/localstep/matching";
import { profileCompletion, useLocalStep } from "@/lib/localstep/store";
import { buildNextSteps } from "@/lib/localstep/next-steps";
import { NextStepCard } from "@/components/localstep/next-step-card";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Home | LocalStep" },
      { name: "description", content: "Your next step starts here. See what to do next and find opportunities that fit." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { account, profile, applications, saved, tasks, deadlines, activities, achievements, allJobs, hydrated, progressError } = useLocalStep();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const completion = profileCompletion(profile);
  const recommendations = getRecommendedJobs(profile, allJobs).slice(0, 3);
  const savedJobs = saved.map((item) => allJobs.find((job) => job.id === item.jobId)).filter((job): job is NonNullable<typeof job> => Boolean(job));
  const nextSteps = useMemo(() => buildNextSteps({ profile, applications, savedJobs, tasks, deadlines, activities, achievements, allJobs }).filter((step) => !dismissed.includes(step.id)), [achievements, activities, allJobs, applications, deadlines, dismissed, profile, savedJobs, tasks]);
  const stats = [
    { label: "Applications", count: applications.length, icon: FileText, to: "/applications" as const },
    { label: "Saved opportunities", count: saved.length, icon: Bookmark, to: "/saved" as const },
    { label: "Open tasks", count: tasks.filter((task) => task.status !== "completed").length, icon: ListChecks, to: "/my-steps" as const },
    { label: "Activities", count: activities.length, icon: ListChecks, to: "/profile" as const },
    { label: "Achievements", count: achievements.length, icon: Sparkles, to: "/profile" as const },
  ];

  return (
    <SitePage>
      <Container className="py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Your next step starts here.</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {profile.name ? `Welcome back, ${profile.name.split(" ")[0]}.` : "Welcome back."}
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Here’s the clearest path forward based on what you’ve saved, started, and shared.
            </p>
          </div>
          {!account ? (
            <Button asChild><Link to="/auth" search={{ mode: "signin" }}>Sign in to save your progress</Link></Button>
          ) : null}
        </div>

        <section className="mt-8 rounded-2xl border border-primary/20 bg-accent/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your next steps</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">What should you do next?</h2>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/profile">Update profile <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {!hydrated ? <p className="text-sm text-muted-foreground">Loading your next steps...</p> : progressError ? <p className="text-sm text-destructive">{progressError}</p> : nextSteps.length ? nextSteps.slice(0, 4).map((step) => <NextStepCard key={step.id} step={step} onDismiss={(id) => setDismissed((current) => [...current, id])} />) : <EmptyState icon={<CheckCircle2 className="mx-auto h-6 w-6" />} title="You’re caught up for now." description="Keep exploring and LocalStep will surface your next action here." action={<Button asChild><Link to="/discover">Discover opportunities</Link></Button>} />}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Progress overview</p><h2 className="mt-2 text-xl font-semibold text-ink">Your LocalStep snapshot</h2></div>
            <Link to="/profile" className="text-sm font-medium text-primary hover:underline">{completion.percent}% profile complete</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map(({ label, count, icon: Icon, to }) => <Link key={label} to={to} className="rounded-xl border border-border bg-surface p-5 hover:border-primary/40">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon className="h-4 w-4 text-primary" /></div>
              <p className="mt-3 text-3xl font-semibold text-ink">{count}</p>
            </Link>)}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface p-4"><Progress value={completion.percent} className="h-2 flex-1" /><span className="text-xs font-medium text-muted-foreground">{completion.percent}% profile complete</span></div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Upcoming deadlines</p><h2 className="mt-2 text-xl font-semibold text-ink">Keep important dates in view</h2></div><Link to="/my-steps" className="text-sm font-medium text-primary hover:underline">Manage deadlines</Link></div>
            <div className="mt-4 space-y-3">{deadlines.length ? deadlines.slice(0, 3).map((deadline) => <Link key={deadline.id} to="/my-steps" className="block rounded-xl border border-border bg-surface p-4 hover:border-primary/40"><div className="flex items-center justify-between gap-3"><p className="font-medium text-ink">{deadline.title}</p><span className="text-xs text-muted-foreground">{new Date(`${deadline.dueDate}T12:00:00`).toLocaleDateString()}</span></div><p className="mt-1 text-sm text-muted-foreground">{deadline.description || "Open My Steps to review this deadline."}</p></Link>) : <EmptyState title="No deadlines yet" description="Add an application, scholarship, school, or personal deadline to keep your plan moving." action={<Button asChild size="sm"><Link to="/my-steps">Add a deadline</Link></Button>} />}</div>
          </div>
          <div>
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your portfolio</p><h2 className="mt-2 text-xl font-semibold text-ink">Build proof of your progress</h2></div><Link to="/profile" className="text-sm font-medium text-primary hover:underline">Open profile</Link></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><Link to="/profile" className="rounded-xl border border-border bg-surface p-4 hover:border-primary/40"><p className="font-medium text-ink">Activities</p><p className="mt-1 text-2xl font-semibold text-primary">{activities.length}</p><p className="text-sm text-muted-foreground">Clubs, volunteering, leadership, and more.</p></Link><Link to="/profile" className="rounded-xl border border-border bg-surface p-4 hover:border-primary/40"><p className="font-medium text-ink">Achievements</p><p className="mt-1 text-2xl font-semibold text-primary">{achievements.length}</p><p className="text-sm text-muted-foreground">Awards, credentials, and milestones.</p></Link></div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Recommended for you</p><h2 className="mt-2 text-xl font-semibold text-ink">A few strong next steps</h2></div><Link to="/discover" className="text-sm font-medium text-primary hover:underline">See all <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">{recommendations.length ? recommendations.map((job) => <JobCard key={job.id} job={job} />) : <div className="lg:col-span-3"><EmptyState icon={<Sparkles className="mx-auto h-6 w-6" />} title="Complete your profile to get recommendations." description="Your Match Scores will become more useful as you add interests, skills, location, and availability." action={<Button asChild><Link to="/profile">Complete profile</Link></Button>} /></div>}</div>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <Button asChild><Link to="/discover">Discover opportunities</Link></Button>
          <Button asChild variant="outline"><Link to="/applications">View applications</Link></Button>
          <Button asChild variant="outline"><Link to="/resume">Build resume</Link></Button>
        </section>
      </Container>
    </SitePage>
  );
}
