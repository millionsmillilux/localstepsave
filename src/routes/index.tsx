import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  Compass,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { JobCard } from "@/components/localstep/job-card";
import { Container, SectionHeading, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoJobs, formatPay } from "@/lib/localstep/jobs";
import { getRecommendedJobs, profileHasData } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LocalStep — Local jobs and internships for students" },
      {
        name: "description",
        content:
          "Find local jobs, internships and real-world experience built for high school and college students — filtered by distance, schedule and experience level.",
      },
      { property: "og:title", content: "LocalStep — Local jobs and internships for students" },
      {
        property: "og:description",
        content: "Your next opportunity is closer than you think. Local jobs. Real experience. Your next step.",
      },
    ],
  }),
  component: HomePage,
});

const heroPreviewJobs = [
  {
    title: "Marketing Assistant",
    employer: "Local Coffee Co.",
    distance: "0.8 mi away",
    tags: ["Part-time", "$15–18/hr", "No experience required"],
  },
  {
    title: "Junior Coding Intern",
    employer: "TechStart Labs",
    distance: "2.1 mi away",
    tags: ["Internship", "After school", "Applications open"],
  },
  {
    title: "Camp Counselor",
    employer: "Barrington Parks",
    distance: "1.4 mi away",
    tags: ["Summer", "Part-time", "Ages 15+"],
  },
];

const valueBar = [
  {
    icon: MapPin,
    title: "Local",
    body: "Opportunities near where you live or study.",
  },
  {
    icon: GraduationCap,
    title: "Student-Friendly",
    body: "Listings designed around school schedules and student experience levels.",
  },
  {
    icon: Sparkles,
    title: "Real Experience",
    body: "Build skills, earn money, and take your first step toward a career.",
  },
];

const problems = [
  {
    title: "Too many irrelevant listings",
    body: "Students have to sort through jobs that require years of experience or don't fit their schedules.",
  },
  {
    title: "Experience requirements",
    body: "Many students are applying for their first job and don't have a long resume yet.",
  },
  {
    title: "Local opportunities are hard to find",
    body: "Great opportunities may exist nearby, but students don't always know where to look.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us what you're looking for",
    body: "Choose your interests, schedule, location, and experience level.",
  },
  {
    number: "02",
    title: "Discover opportunities",
    body: "Browse jobs and internships that actually fit your situation.",
  },
  {
    number: "03",
    title: "Take your next step",
    body: "Apply directly and start building real-world experience.",
  },
];

const differentiators = [
  {
    icon: CalendarClock,
    title: "Schedule-aware",
    body: "Find opportunities that work around school, sports, clubs, and other commitments.",
  },
  {
    icon: GraduationCap,
    title: "Experience-friendly",
    body: "Discover jobs that don't expect you to already have a five-year resume.",
  },
  {
    icon: Compass,
    title: "Local-first",
    body: "See opportunities based on where you actually live or study.",
  },
  {
    icon: Users,
    title: "Student-focused",
    body: "The entire experience is designed around taking your first steps into the working world.",
  },
];

const previewChips = [
  "Part-time",
  "Internship",
  "Summer",
  "After school",
  "Weekend",
  "No experience",
  "Within 5 miles",
];

const pricing = [
  {
    name: "Basic",
    price: "Free",
    cadence: "",
    features: ["1 active job listing", "Standard placement", "Basic applicant information"],
    cta: "Post for Free",
    highlighted: false,
  },
  {
    name: "Featured",
    price: "$15",
    cadence: "/ listing",
    features: ["Higher placement", "Featured badge", "More visibility", "Applicant insights"],
    cta: "Feature a Job",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$30",
    cadence: "/ month",
    features: ["Unlimited job postings", "Featured placement", "Applicant management", "Business profile"],
    cta: "Choose Business",
    highlighted: false,
  },
];

function HeroPreview() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-raised)]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <div className="ml-3 flex-1 truncate rounded-md bg-surface-sunken px-3 py-1 text-xs text-muted-foreground">
          localstep.app/jobs
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr]">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden="true" />
            Marketing
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            60010
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-primary/30 bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            Within 5 miles
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            After school
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            No experience
          </span>
        </div>

        <ul className="space-y-3">
          {heroPreviewJobs.map((job) => (
            <li key={job.title} className="rounded-lg border border-border bg-surface p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.employer}</p>
                </div>
                <span className="shrink-0 rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {job.distance}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-surface-sunken px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted-foreground">Sample listings shown for demonstration.</p>
      </div>
    </div>
  );
}

function DiscoveryPreview() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeChips, setActiveChips] = useState<string[]>(["Within 5 miles"]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return demoJobs
      .filter((job) => {
        if (q && !`${job.title} ${job.employer} ${job.category} ${job.summary}`.toLowerCase().includes(q)) return false;
        if (loc && !job.location.toLowerCase().includes(loc)) return false;
        return activeChips.every((chip) => {
          switch (chip) {
            case "Within 5 miles":
              return job.distanceMiles <= 5;
            case "No experience":
              return job.experience === "No experience required";
            case "Weekend":
              return job.schedule.toLowerCase().includes("weekend");
            case "After school":
              return job.schedule.toLowerCase().includes("after school");
            case "Summer":
              return job.schedule === "Summer" || job.employmentType === "Summer";
            default:
              return job.employmentType === chip;
          }
        });
      })
      .slice(0, 4);
  }, [query, location, activeChips]);

  function toggleChip(chip: string) {
    setActiveChips((prev) => (prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]));
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr]">
        <div>
          <label htmlFor="preview-search" className="sr-only">
            Job title, skill, or keyword
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="preview-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Job title, skill, or keyword"
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <label htmlFor="preview-location" className="sr-only">
            ZIP code or city
          </label>
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="preview-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="ZIP code or city"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {previewChips.map((chip) => {
          const active = activeChips.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              aria-pressed={active}
              onClick={() => toggleChip(chip)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary/40 bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {results.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {results.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No sample listings match those filters. Try removing one.
        </p>
      ) : null}

      <div className="mt-6 flex justify-center">
        <Button asChild variant="outline">
          <Link to="/jobs">
            Explore All Opportunities <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function HomePage() {
  const { profile, allJobs, isSaved, toggleSaved } = useLocalStep();
  const personalizedJobs = profileHasData(profile) ? getRecommendedJobs(profile, allJobs).slice(0, 3) : [];

  return (
    <SitePage>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-sunken px-3 py-1 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Local jobs. Real experience. Your next step.
            </span>
            <h1 className="mt-5 text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Your next opportunity is closer than you think.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Find local jobs, internships, and real-world experience built for students — without digging through
              thousands of irrelevant listings.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/jobs">Find Opportunities</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/employers">I'm an Employer</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Built for students. Designed for local businesses.</p>
          </div>

          <div>
            <HeroPreview />
            <div className="mt-5 rounded-xl border border-border bg-surface-sunken px-4 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Designed around your schedule
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {["After school", "Weekends", "Summer", "Near you"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Value bar */}
      <section className="border-b border-border bg-surface">
        <Container className="grid gap-8 py-10 sm:grid-cols-3">
          {valueBar.map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-ink">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {profileHasData(profile) ? (
        <section className="border-b border-border bg-surface py-20">
          <Container>
            <SectionHeading
              eyebrow="Recommended for you"
              title="Opportunities that fit your profile."
              description="These are the best matches based on your interests, schedule, location, and experience level."
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {personalizedJobs.map((job) => {
                const score = getRecommendedJobs(profile, [job])[0]?.score ?? 0;
                const saved = isSaved(job.id);

                return (
                  <article key={job.id} className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-semibold text-ink">{job.title}</p>
                      <span className="rounded-full border border-border bg-surface-sunken px-2 py-1 text-xs font-medium text-ink">
                        {score}% Match
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{job.employer}</p>
                    <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                      <p>{job.location} · {job.distanceMiles} mi away</p>
                      <p>{formatPay(job)}</p>
                      <p>{job.schedule}</p>
                      <p>{job.experience}</p>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                          View opportunity
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" type="button" onClick={() => toggleSaved(job.id)} aria-pressed={saved}>
                        {saved ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ) : (
        <section className="border-b border-border bg-surface py-20">
          <Container className="max-w-2xl">
            <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center">
              <p className="text-lg font-semibold text-ink">Complete your profile to unlock personalized matches</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us about your interests, availability, skills, and location so LocalStep can find opportunities that fit you.
              </p>
              <Button asChild className="mt-5">
                <Link to="/profile">Complete My Profile</Link>
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* Problem */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="The problem"
            title="Finding your first job shouldn't feel like a full-time job."
            description="Traditional job platforms are built for experienced workers. Students need something different — opportunities that understand school schedules, limited experience, transportation, and the importance of getting that first opportunity."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {problems.map((problem) => (
              <div key={problem.title} className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-base font-semibold text-ink">{problem.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{problem.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface py-20">
        <Container>
          <SectionHeading eyebrow="How it works" title="Your next step, in three moves." />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.number} className="border-t-2 border-primary/25 pt-5">
                <span className="text-sm font-semibold tracking-[0.16em] text-primary">{step.number}</span>
                <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Discovery */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Job discovery"
            title="Opportunities that fit your life."
            description="Filter by what actually matters when you're a student."
          />
          <div className="mt-10">
            <DiscoveryPreview />
          </div>
        </Container>
      </section>

      {/* Differentiators */}
      <section className="border-y border-border bg-surface py-20">
        <Container>
          <SectionHeading eyebrow="Why LocalStep" title="Built around the student, not the resume." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {differentiators.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl border border-border p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Employer */}
      <section className="bg-ink py-20 text-background">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-background/60">For employers</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Need your next great part-time hire?
            </h2>
            <p className="mt-3 max-w-md text-base text-background/70">
              Reach local students who are actively looking for their next opportunity.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Create a job listing",
                "Reach students nearby",
                "Highlight student-friendly opportunities",
                "Manage applicants",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-background/85">
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button asChild size="lg" variant="secondary">
                <Link to="/employer/jobs/new">Post a Job</Link>
              </Button>
            </div>
            <p className="mt-4 max-w-md text-xs text-background/60">
              Businesses can start with a basic listing and upgrade for additional visibility and tools.
            </p>
          </div>

          <div className="rounded-2xl border border-background/15 bg-background/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Employer dashboard</p>
              <span className="rounded-full bg-background/10 px-2 py-0.5 text-[11px] text-background/70">
                Demo data
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Applicants", value: "17" },
                { label: "Job views", value: "482" },
                { label: "Applications", value: "17" },
                { label: "Active listings", value: "2" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-background/15 bg-background/5 p-4">
                  <p className="text-xs text-background/60">{stat.label}</p>
                  <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                { title: "Marketing Assistant", views: 24, applicants: 6 },
                { title: "Camp Counselor", views: 41, applicants: 11 },
              ].map((row) => (
                <div
                  key={row.title}
                  className="flex items-center justify-between rounded-lg border border-background/15 px-3.5 py-3 text-sm"
                >
                  <span className="font-medium">{row.title}</span>
                  <span className="text-xs text-background/60">
                    {row.views} views · {row.applicants} applicants
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing for local employers."
            description="Example pricing for the MVP. Final pricing may change, and no payments are processed yet."
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pricing.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "flex flex-col rounded-xl border bg-surface p-6",
                  tier.highlighted ? "border-primary shadow-[var(--shadow-raised)]" : "border-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-ink">{tier.name}</h3>
                  {tier.highlighted ? (
                    <Badge className="border-transparent bg-accent text-accent-foreground hover:bg-accent">
                      Most visibility
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-4 text-3xl font-semibold text-ink">
                  {tier.price}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">{tier.cadence}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6" variant={tier.highlighted ? "default" : "outline"}>
                  <Link to="/employer/jobs/new">{tier.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Student CTA */}
      <section className="border-t border-border bg-surface py-20">
        <Container className="text-center">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Your first opportunity starts somewhere.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Find something local. Build experience. Take the next step.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/jobs">Find Opportunities</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/profile">Create Student Profile</Link>
            </Button>
          </div>
        </Container>
      </section>
    </SitePage>
  );
}
