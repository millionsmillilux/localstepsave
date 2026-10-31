import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Send,
  Users,
} from "lucide-react";

import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoJobs } from "@/lib/localstep/jobs";

export const Route = createFileRoute("/schools")({
  head: () => ({
    meta: [
      { title: "Student portal for schools & youth organizations | LocalStep" },
      {
        name: "description",
        content:
          "Connect your students with local part-time jobs and internships. Track groups, share opportunities and see engagement in one place.",
      },
      { property: "og:title", content: "Student portal for schools & youth organizations | LocalStep" },
      {
        property: "og:description",
        content: "Connect your students with local part-time jobs and internships from one simple portal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SchoolPortal,
});

const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, current: true },
  { label: "Student Groups", icon: Users, current: false },
  { label: "Shared Opportunities", icon: Send, current: false },
  { label: "Events", icon: CalendarDays, current: false },
  { label: "Resources", icon: BookOpen, current: false },
];

const stats = [
  { label: "Students Connected", value: "248" },
  { label: "Active Groups", value: "6" },
  { label: "Opportunities Shared", value: "34" },
  { label: "Applications Started", value: "91" },
];

const groups = [
  { name: "Class of 2027 — Career Readiness", students: 64, advisor: "Ms. Alvarez", active: 41 },
  { name: "Barrington Youth Center", students: 52, advisor: "Coach Lee", active: 29 },
  { name: "Summer Internship Cohort", students: 38, advisor: "Mr. Whitfield", active: 33 },
  { name: "First Job Workshop", students: 94, advisor: "Ms. Alvarez", active: 47 },
];

const upcoming = [
  { title: "Resume basics workshop", when: "Thu, Sep 17 · 3:30 PM", place: "Library, Room 2" },
  { title: "Local employer meet & greet", when: "Tue, Sep 22 · 4:00 PM", place: "Community Center" },
  { title: "Summer internship info night", when: "Mon, Sep 28 · 6:00 PM", place: "Auditorium" },
];

function SchoolPortal() {
  const shared = demoJobs.slice(0, 3);

  return (
    <SitePage>
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside>
            <nav aria-label="School portal" className="rounded-xl border border-border bg-surface p-2">
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
              Portal sections other than Overview are part of the demo shell.
            </p>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                  Welcome back, Barrington High School
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Connect your students with nearby jobs and internships. Numbers shown are demo data.
                </p>
              </div>
              <Button asChild>
                <Link to="/jobs">
                  <Plus className="mr-1.5 h-4 w-4" /> Share an Opportunity
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
              <h2 className="text-base font-semibold text-ink">Student groups</h2>
              <ul className="mt-4 space-y-3">
                {groups.map((group) => (
                  <li
                    key={group.name}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{group.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.students} students · {group.active} active this month · Advisor {group.advisor}
                      </p>
                    </div>
                    <Badge className="w-fit border-transparent bg-success/12 text-success hover:bg-success/12">
                      Connected
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-base font-semibold text-ink">Recently shared with students</h2>
              <ul className="mt-4 space-y-3">
                {shared.map((job) => (
                  <li
                    key={job.id}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        to="/jobs/$jobId"
                        params={{ jobId: job.id }}
                        className="text-sm font-semibold text-ink hover:text-primary"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {job.employer} · {job.location} · {job.schedule}
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      Shared
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-base font-semibold text-ink">Upcoming sessions</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {upcoming.map((event) => (
                  <li key={event.title} className="rounded-xl border border-border bg-surface p-5">
                    <p className="text-sm font-semibold text-ink">{event.title}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{event.when}</p>
                    <p className="text-xs text-muted-foreground">{event.place}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-base font-semibold text-ink">Invite a new group</h2>
              <div className="mt-4">
                <EmptyState
                  icon={<GraduationCap className="mx-auto h-6 w-6" />}
                  title="Add another class or program"
                  description="Invite students by class, club or program so advisors can share opportunities with the right group."
                  action={
                    <Button asChild>
                      <Link to="/contact">Request an invite link</Link>
                    </Button>
                  }
                />
              </div>
            </section>
          </div>
        </div>
      </Container>
    </SitePage>
  );
}
