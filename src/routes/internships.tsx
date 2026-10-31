import { Link, createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";

import { JobCard } from "@/components/localstep/job-card";
import { Container, EmptyState, SectionHeading, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { useLocalStep } from "@/lib/localstep/store";

export const Route = createFileRoute("/internships")({
  staticData: { sitemap: true },
  head: () => ({ ...seoHead({ path: "/internships", title: "Student Internships Near You | LocalStep", description: "Browse local internships for high school and college students on LocalStep, with after-school, summer and flexible schedules." }) }),
  component: InternshipsPage,
});

function InternshipsPage() {
  const { allJobs } = useLocalStep();
  const internships = allJobs.filter((job) => job.employmentType === "Internship" && !job.demo && job.active !== false);

  return (
    <SitePage>
      <div className="border-b border-border bg-surface">
        <Container className="py-14">
          <SectionHeading
            eyebrow="Internships"
            title="Real internships, built for students."
            description="Internships that accept first-time applicants, run around the school calendar, and stay close to home."
          />
        </Container>
      </div>

      <Container className="py-10">
        {internships.length === 0 ? (
          <EmptyState
            title="No internships open right now"
            description="Check back soon, or browse part-time and summer opportunities instead."
            action={
              <Button asChild>
                <Link to="/jobs">Browse all opportunities</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {internships.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/jobs">See every opportunity</Link>
          </Button>
        </div>
      </Container>
    </SitePage>
  );
}
