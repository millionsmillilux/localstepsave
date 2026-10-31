import { Link, createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, Building2, CreditCard, LayoutDashboard, Plus, Users } from "lucide-react";

import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useJobInterest } from "@/lib/localstep/analytics";
import { useLocalStep } from "@/lib/localstep/store";

export const Route = createFileRoute("/employer/")({
  head: () => ({
    meta: [
      { title: "Employer dashboard | LocalStep" },
      { name: "description", content: "Manage your student job listings, applicants and company profile." },
      { property: "og:title", content: "Employer dashboard | LocalStep" },
      { property: "og:description", content: "Manage your student job listings, applicants and company profile." },
    ],
  }),
  component: EmployerDashboard,
});

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, current: true },
  { label: "Jobs", icon: BriefcaseBusiness, current: false },
  { label: "Applicants", icon: Users, current: false },
  { label: "Company Profile", icon: Building2, current: false },
  { label: "Billing", icon: CreditCard, current: false },
];

function EmployerDashboard() {
  const { account, employerJobs, allJobs, hydrated } = useLocalStep();
  const businessName = account?.businessName ?? "Local Coffee Co.";
  const postedCount = hydrated ? employerJobs.length : 0;
  const { data: interest = [], isLoading } = useJobInterest();

  const totalViews = interest.reduce((sum, row) => sum + Number(row.views ?? 0), 0);
  const totalApplications = interest.reduce((sum, row) => sum + Number(row.applications ?? 0), 0);

  const topListings = interest
    .slice()
    .sort((a, b) => Number(b.views ?? 0) - Number(a.views ?? 0))
    .slice(0, 8)
    .map((row) => ({
      ...row,
      title: row.job_title ?? allJobs.find((job) => job.id === row.job_id)?.title ?? row.job_id,
    }));

  const stats = [
    { label: "Active Jobs", value: String(postedCount) },
    { label: "Listings with interest", value: String(interest.length) },
    { label: "Job Views", value: String(totalViews) },
    { label: "Applications", value: String(totalApplications) },
  ];

  return (
    <SitePage>
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside>
            <nav aria-label="Employer" className="rounded-xl border border-border bg-surface p-2">
              {sidebarItems.map((item) => (
                <span
                  key={item.label}
                  aria-current={item.current ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                    item.current ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </span>
              ))}
            </nav>
            <p className="mt-3 px-3 text-xs text-muted-foreground">
              Dashboard sections other than Jobs are part of the demo shell.
            </p>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">Good morning, {businessName}</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Here's how your listings are doing. Numbers shown are demo data.
                </p>
              </div>
              <Button asChild>
                <Link to="/employer/jobs/new">
                  <Plus className="mr-1.5 h-4 w-4" /> Post New Job
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
                </div>
              ))}
            </div>

            <section className="mt-10">
              <h2 className="text-base font-semibold text-ink">Most viewed listings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Counted from real views and applications on this site.
              </p>
              <ul className="mt-4 space-y-3">
                {topListings.map((row) => (
                  <li
                    key={row.job_id}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        to="/jobs/$jobId"
                        params={{ jobId: row.job_id }}
                        className="text-sm font-semibold text-ink hover:text-primary"
                      >
                        {row.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {Number(row.views ?? 0)} views · {Number(row.applications ?? 0)} applications
                        {row.employer ? ` · ${row.employer}` : ""}
                      </p>
                    </div>
                    <Badge className="w-fit border-transparent bg-success/12 text-success hover:bg-success/12">
                      Active
                    </Badge>
                  </li>
                ))}
              </ul>
              {!isLoading && topListings.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No activity recorded yet. Open a job page or send an application and it will show up here.
                </p>
              ) : null}
            </section>

            {hydrated && employerJobs.length === 0 ? (
              <section className="mt-10">
                <h2 className="text-base font-semibold text-ink">Your listings</h2>
                <div className="mt-4">
                  <EmptyState
                    icon={<BriefcaseBusiness className="mx-auto h-6 w-6" />}
                    title="You haven't posted a job yet"
                    description="Create your first listing and reach students near your business."
                    action={
                      <Button asChild>
                        <Link to="/employer/jobs/new">Post a Job</Link>
                      </Button>
                    }
                  />
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </Container>
    </SitePage>
  );
}
