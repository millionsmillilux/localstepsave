import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownUp, BriefcaseBusiness, CalendarClock, GraduationCap, HeartHandshake, Medal, School, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { JobCard } from "@/components/localstep/job-card";
import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStep } from "@/lib/localstep/store";
import { getOpportunityMatch } from "@/lib/localstep/matching";
import { getRecommendedJobs } from "@/lib/localstep/matching";
import type { OpportunityType } from "@/lib/localstep/types";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover opportunities | LocalStep" }, { name: "description", content: "Find real jobs, internships, volunteering, scholarships, college programs, and competitions." }] }),
  component: DiscoverPage,
});

const types: { value: OpportunityType; label: string; icon: typeof BriefcaseBusiness }[] = [
  { value: "job", label: "Jobs", icon: BriefcaseBusiness },
  { value: "internship", label: "Internships", icon: GraduationCap },
  { value: "volunteer", label: "Volunteering", icon: HeartHandshake },
  { value: "scholarship", label: "Scholarships", icon: Medal },
  { value: "college_program", label: "College Programs", icon: School },
  { value: "competition", label: "Competitions", icon: Medal },
];

function DiscoverPage() {
  const { allJobs, hydrated, profile } = useLocalStep();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<OpportunityType | "all">("all");
  const [sort, setSort] = useState<"match" | "newest" | "deadline">("match");
  const [location, setLocation] = useState("");
  const [deadlineOnly, setDeadlineOnly] = useState(false);

  const jobs = useMemo(() => {
    const now = Date.now();
    const filtered = allJobs.filter((job) => {
      if (job.demo || job.active === false || (job.deadline && new Date(job.deadline).getTime() < now)) return false;
      if (type !== "all" && (job.opportunityType ?? "job") !== type) return false;
      const text = `${job.title} ${job.employer} ${job.summary} ${job.description} ${job.tags?.join(" ") ?? ""}`.toLowerCase();
      if (query.trim() && !text.includes(query.trim().toLowerCase())) return false;
      if (location.trim() && !job.location.toLowerCase().includes(location.trim().toLowerCase())) return false;
      if (deadlineOnly && !job.deadline) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "newest") return a.postedDaysAgo - b.postedDaysAgo;
      if (sort === "deadline") return new Date(a.deadline ?? "9999-12-31").getTime() - new Date(b.deadline ?? "9999-12-31").getTime();
      return (getOpportunityMatch(profile, b)?.score ?? 0) - (getOpportunityMatch(profile, a)?.score ?? 0);
    });
  }, [allJobs, deadlineOnly, location, profile, query, sort, type]);

  const counts = useMemo(() => Object.fromEntries(types.map((item) => [item.value, allJobs.filter((job) => !job.demo && (job.opportunityType ?? "job") === item.value && job.active !== false && (!job.deadline || new Date(job.deadline).getTime() >= Date.now())).length])) as Record<OpportunityType, number>, [allJobs]);
  const recommended = getRecommendedJobs(profile, allJobs).slice(0, 3);

  return <SitePage><Container className="py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">Discover</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Find your next opportunity</h1><p className="mt-2 max-w-2xl text-muted-foreground">Search real opportunities and use your Match Score to decide what deserves your next step.</p></div><div className="relative w-full sm:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, organization, or skill" className="pl-9" /></div></div>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{types.map(({ value, label, icon: Icon }) => <button type="button" key={value} onClick={() => setType(type === value ? "all" : value)} className={`rounded-xl border p-5 text-left transition-colors ${type === value ? "border-primary bg-accent/50" : "border-border bg-surface hover:border-primary/40"}`}><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-primary" /><span className="text-sm font-medium text-muted-foreground">{counts[value] ?? 0}</span></div><h2 className="mt-4 font-semibold text-ink">{label}</h2><p className="mt-1 text-sm text-muted-foreground">{counts[value] ? "Real opportunities available now" : "No real records yet"}</p></button>)}</div>
    {recommended.length ? <section className="mt-10"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Recommended for you</p><h2 className="mt-2 text-xl font-semibold text-ink">Strong matches from your profile</h2></div><span className="text-sm text-muted-foreground">Powered by Match Score</span></div><div className="mt-4 grid gap-4 lg:grid-cols-3">{recommended.map((job) => <JobCard key={job.id} job={job} />)}</div></section> : null}
    <section className="mt-10" id="opportunities"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{type === "all" ? "All opportunity types" : types.find((item) => item.value === type)?.label}</p><h2 className="mt-2 text-2xl font-semibold text-ink">{jobs.length ? `${jobs.length} opportunity${jobs.length === 1 ? "" : "ies"}` : "No opportunities found"}</h2></div><div className="flex flex-wrap gap-2"><Input className="w-40" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location or city" /><Select value={sort} onValueChange={(value: typeof sort) => setSort(value)}><SelectTrigger className="w-36"><ArrowDownUp className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="match">Match Score</SelectItem><SelectItem value="newest">Newest</SelectItem><SelectItem value="deadline">Deadline</SelectItem></SelectContent></Select><Button variant={deadlineOnly ? "default" : "outline"} size="sm" onClick={() => setDeadlineOnly(!deadlineOnly)}><CalendarClock className="mr-1 h-4 w-4" /> Deadlines</Button></div></div><div className="mt-5 grid gap-4 lg:grid-cols-3">{!hydrated ? <p className="text-sm text-muted-foreground">Loading real opportunities...</p> : jobs.length ? jobs.map((job) => <JobCard key={job.id} job={job} />) : <div className="lg:col-span-3"><EmptyState icon={<Search className="mx-auto h-6 w-6" />} title="No real opportunities match these filters." description="Try another search or category. LocalStep never fills empty categories with fake listings." /></div>}</div></section>
  </Container></SitePage>;
}
