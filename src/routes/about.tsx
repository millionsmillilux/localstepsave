import { Link, createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";

import { Container, SectionHeading, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({ ...seoHead({ path: "/about", title: "About LocalStep | The Local Jobs Marketplace for Students", description: "Learn why we built LocalStep, a local jobs and internship marketplace made specifically for high school and college students." }) }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SitePage>
      <Container className="max-w-3xl py-16">
        <SectionHeading
          eyebrow="About"
          title="Work experience shouldn't depend on who you know."
          description="LocalStep is a student opportunity platform designed around the next step, not just the next listing."
        />

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Most job boards were built for full-time careers. Students end up scrolling past roles that require years of
            experience, full weekday availability, or a commute they can't make. Meanwhile, local businesses genuinely
            need reliable part-time help and struggle to reach students nearby.
          </p>
          <p>
            LocalStep puts the details students actually filter on right at the front: how far away the opportunity is, what it
            pays, what hours it needs, the minimum age, and whether experience is required. Employers write listings
            once, and students see exactly what they're signing up for.
          </p>
          <p>
            We keep the product deliberately simple. No résumé gatekeeping, no long applications, no sensitive personal
            information collected up front. A student profile plus a short note is enough to start a conversation with a
            local employer.
          </p>
          <p>
            LocalStep now connects to live opportunity records and student accounts through Supabase. When a category has
            no live records, we show an honest empty state instead of filling it with fictional listings.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/discover">Browse opportunities</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/employers">For employers</Link>
          </Button>
        </div>
      </Container>
    </SitePage>
  );
}
