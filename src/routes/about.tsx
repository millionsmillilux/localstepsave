import { Link, createFileRoute } from "@tanstack/react-router";

import { Container, SectionHeading, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About LocalStep | Local jobs for students" },
      {
        name: "description",
        content: "LocalStep helps high school and college students find real, nearby work that fits their schedule.",
      },
      { property: "og:title", content: "About LocalStep | Local jobs for students" },
      { property: "og:description", content: "Why we built a jobs marketplace made specifically for students." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SitePage>
      <Container className="max-w-3xl py-16">
        <SectionHeading
          eyebrow="About"
          title="Work experience shouldn't depend on who you know."
          description="LocalStep is a marketplace for local part-time jobs and internships, designed around students rather than adapted for them."
        />

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Most job boards were built for full-time careers. Students end up scrolling past roles that require years of
            experience, full weekday availability, or a commute they can't make. Meanwhile, local businesses genuinely
            need reliable part-time help and struggle to reach students nearby.
          </p>
          <p>
            LocalStep puts the details students actually filter on right at the front: how far away the job is, what it
            pays, what hours it needs, the minimum age, and whether experience is required. Employers write listings
            once, and students see exactly what they're signing up for.
          </p>
          <p>
            We keep the product deliberately simple. No résumé gatekeeping, no long applications, no sensitive personal
            information collected up front. A student profile plus a short note is enough to start a conversation with a
            local employer.
          </p>
          <p>
            This is an early product. All listings shown are fictional demonstration data, and accounts are stored on
            your device while we build out the full platform.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/jobs">Browse opportunities</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/employers">For employers</Link>
          </Button>
        </div>
      </Container>
    </SitePage>
  );
}
