import { HirePricing } from "@/components/localstep/hire-pricing";
import { organizationJsonLd, seoHead } from "@/lib/seo";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  Compass,
  GraduationCap,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import { Container, SectionHeading, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPay } from "@/lib/localstep/jobs";
import { getOpportunityMatch, getRecommendedJobs, profileHasData } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({ ...seoHead({ path: "/", title: "LocalStep | Local Jobs & Internships for High School and College Students", description: "LocalStep is the local jobs and internship marketplace for high school and college students. Find part-time jobs, internships and volunteering near you, and track every application in one place." }), scripts: [{ type: "application/ld+json", children: JSON.stringify(organizationJsonLd) }] }),
  component: HomePage,
});

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
    title: "Discover",
    body: "Find jobs, internships, volunteer opportunities, scholarships, college programs, and competitions.",
  },
  {
    number: "02",
    title: "Track",
    body: "Keep applications, deadlines, tasks, and saved opportunities organized.",
  },
  {
    number: "03",
    title: "Build",
    body: "Capture activities, volunteering, skills, achievements, and experiences.",
  },
  {
    number: "04",
    title: "Prepare",
    body: "Keep everything organized as you prepare for college and your future.",
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



function HomePage() {
  const { profile, allJobs, isSaved, toggleSaved } = useLocalStep();
  const personalizedJobs = profileHasData(profile)
    ? getRecommendedJobs(profile, allJobs).slice(0, 3)
    : [];

  return (
    <SitePage>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-sunken px-3 py-1 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              LocalStep · Local jobs and internships for students
            </span>
            <h1 className="mt-5 text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Find jobs and internships close to home.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              LocalStep connects high school and college students with local businesses that are hiring.
              You can also explore volunteering, programs and other opportunities, then track every
              application in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/jobs">Find Local Jobs</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/discover">Explore All Opportunities</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Discover → Track → Build → Prepare
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-accent/40 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Your path, in one place
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              Make progress you can see.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Start with a student profile, explore opportunities that fit, then use your command
              center to keep applications, tasks, deadlines, activities, and achievements moving.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Discover what fits", "Track what matters", "Build your story", "Prepare for what's next"].map((item) => (
                <div key={item} className="rounded-lg border border-primary/15 bg-surface px-3 py-3 text-sm font-medium text-ink">
                  {item}
                </div>
              ))}
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
                const score = getOpportunityMatch(profile, job)?.score ?? 0;
                const saved = isSaved(job.id);

                return (
                  <article
                    key={job.id}
                    className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-semibold text-ink">{job.title}</p>
                      <span className="rounded-full border border-border bg-surface-sunken px-2 py-1 text-xs font-medium text-ink">
                        {score}% Match
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{job.employer}</p>
                    <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                      <p>
                        {job.location} · {job.distanceMiles} mi away
                      </p>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => toggleSaved(job.id)}
                        aria-pressed={saved}
                      >
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
              <p className="text-lg font-semibold text-ink">
                Complete your profile to unlock personalized matches
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us about your interests, availability, skills, and location so LocalStep can
                find opportunities that fit you.
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
          <SectionHeading eyebrow="How it works"           title="Discover → Track → Build → Prepare" />
          <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.number} className="border-t-2 border-primary/25 pt-5">
                <span className="text-sm font-semibold tracking-[0.16em] text-primary">
                  {step.number}
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Differentiators */}
      <section className="border-y border-border bg-surface py-20">
        <Container>
          <SectionHeading
            eyebrow="Why LocalStep"
            title="Built around the student, not the resume."
          />
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-background/60">
              For employers
            </p>
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
              Posting is free. You only pay a one-time fee when you hire a student through LocalStep.
            </p>
          </div>

          <div className="rounded-2xl border border-background/15 bg-background/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-background/60">
              For local businesses
            </p>
            <h3 className="mt-3 text-xl font-semibold">Meet students who are ready to start.</h3>
            <p className="mt-3 text-sm leading-6 text-background/70">
              Share a clear, student-friendly opportunity and connect with people nearby who are
              looking for their next step.
            </p>
            <Link
              to="/employers"
              className="mt-5 inline-flex text-sm font-medium text-background underline-offset-4 hover:underline"
            >
              Learn more about hiring on LocalStep <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="Post for free. Pay only when you hire."
            description="LocalStep is commission-based: listings cost nothing, and you pay a one-time fee only for each successful hire."
            align="center"
          />
          <HirePricing />
        </Container>
      </section>

      {/* Student CTA */}
      <section className="border-t border-border bg-surface py-20">
        <Container className="text-center">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Everything you are doing for your future, organized here.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Keep your next actions, experiences, and opportunities moving toward college and your future.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/discover">Explore Opportunities</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/profile">Build Your Student Profile</Link>
            </Button>
          </div>
        </Container>
      </section>
    </SitePage>
  );
}
