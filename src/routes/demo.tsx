import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Store } from "lucide-react";

import { Container, SectionHeading, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { seoHead } from "@/lib/seo";
import { useLocalStep } from "@/lib/localstep/store";

export const Route = createFileRoute("/demo")({
  staticData: { sitemap: true },
  head: () => ({
    ...seoHead({
      path: "/demo",
      title: "LocalStep Demo Catalog",
      description:
        "Explore fictional LocalStep businesses, student profiles, listings, applications, and saves.",
    }),
  }),
  component: DemoPage,
});

function DemoPage() {
  const { businessProfiles, demoStudents, allJobs, demoApplications } = useLocalStep();
  const demoJobs = allJobs.filter((job) => job.demo);

  return (
    <SitePage>
      <Container className="py-12">
        <SectionHeading
          eyebrow="DEMO MODE"
          title="A complete LocalStep walkthrough"
          description="Explore the fictional catalog that powers this product demo. The businesses, students, listings, applications, and saves below are not real accounts or commitments."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            { Icon: Store, value: businessProfiles.filter((p) => p.id.startsWith("demo-")).length, label: "Business profiles" },
            { Icon: BriefcaseBusiness, value: demoJobs.length, label: "Demo listings" },
            { Icon: GraduationCap, value: demoStudents.length, label: "Student profiles" },
            { Icon: ArrowRight, value: demoApplications.length, label: "Sample applications" },
          ].map(({ Icon, value, label }) => (
            <div key={label} className="rounded-xl border border-border bg-surface p-5">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Business catalog</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Interview-inspired categories and addresses, presented as fictional demo profiles.
              </p>
            </div>
            <Badge variant="secondary">32 businesses</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {businessProfiles
              .filter((profile) => profile.id.startsWith("demo-"))
              .map((business) => (
                <Link
                  key={business.id}
                  to="/employers/$employerId"
                  params={{ employerId: business.slug }}
                  className="rounded-xl border border-border bg-surface p-4 transition hover:border-primary/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-ink">{business.name}</h3>
                    <Badge variant="outline">DEMO</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {business.industry} · {business.location}
                  </p>
                </Link>
              ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Student profiles</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Varied interests, schedules, experience levels, and goals for matching
                demonstrations.
              </p>
            </div>
            <Badge variant="secondary">8 students</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {demoStudents.map((student) => (
              <div key={student.id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{student.profile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {student.profile.school} · Class of {student.profile.graduationYear}
                    </p>
                  </div>
                  <Badge variant="outline">DEMO</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{student.profile.bio}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-ink">Interests:</span>{" "}
                  {student.profile.interests.join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-ink">Skills:</span>{" "}
                  {student.profile.skills.join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-ink">Availability:</span>{" "}
                  {student.profile.availability.join(", ")}
                </p>
                <p className="mt-3 text-xs text-primary">
                  {student.activities.length} activity · {student.achievements.length} achievement ·{" "}
                  {student.profile.experience}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </SitePage>
  );
}
