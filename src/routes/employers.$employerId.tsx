import { Link, createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Building2, Globe, MapPin, Phone } from "lucide-react";

import { Container, SitePage } from "@/components/localstep/page";
import { VerifiedBadge } from "@/components/localstep/verified-badge";
import { Button } from "@/components/ui/button";
import { useLocalStep } from "@/lib/localstep/store";

export const Route = createFileRoute("/employers/$employerId")({
  staticData: { sitemap: false },
  head: () => ({ ...seoHead({ path: "/employers", title: "Employer Profile | LocalStep", description: "See this employer's profile and open opportunities for students on LocalStep.", noindex: true }) }),
  component: EmployerProfilePage,
});

function EmployerProfilePage() {
  const { employerId } = Route.useParams();
  const { getBusinessProfile, allJobs, hydrated } = useLocalStep();
  const profile = getBusinessProfile(employerId);
  if (!hydrated) return null;
  if (!profile)
    return (
      <SitePage>
        <Container className="py-24 text-center">
          <h1 className="text-2xl font-semibold text-ink">Employer profile not found</h1>
          <Button asChild className="mt-6">
            <Link to="/jobs">Browse opportunities</Link>
          </Button>
        </Container>
      </SitePage>
    );
  return (
    <SitePage>
      <Container className="max-w-3xl py-12">
        <div className="rounded-2xl border border-border bg-surface p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-accent p-3 text-accent-foreground">
              <Building2 />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-ink">{profile.name}</h1>
                {profile.verificationStatus === "approved" ? <VerifiedBadge /> : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location ? (
                  <span>
                    <MapPin className="mr-1 inline h-4 w-4" />
                    {profile.location}
                  </span>
                ) : null}
                {profile.website ? (
                  <a
                    className="hover:text-primary"
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe className="mr-1 inline h-4 w-4" />
                    Website
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile.industry ? <span>{profile.industry}</span> : null}
            {profile.contactEmail ? (
              <a className="hover:text-primary" href={`mailto:${profile.contactEmail}`}>
                {profile.contactEmail}
              </a>
            ) : null}
            {profile.phone ? (
              <a className="hover:text-primary" href={`tel:${profile.phone}`}>
                <Phone className="mr-1 inline h-4 w-4" />
                {profile.phone}
              </a>
            ) : null}
          </div>
          <p className="mt-7 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {profile.description || "This employer has not added a description yet."}
          </p>
          <section className="mt-8 border-t border-border pt-6">
            <h2 className="text-base font-semibold text-ink">Active opportunities</h2>
            <div className="mt-3 space-y-2">
              {allJobs
                .filter(
                  (job) =>
                    job.active !== false &&
                    (job.ownerId === profile.ownerId || job.employer === profile.name),
                )
                .map((job) => (
                  <Link
                    key={job.id}
                    to="/jobs/$jobId"
                    params={{ jobId: job.id }}
                    className="block rounded-lg border border-border p-3 text-sm hover:border-primary/40"
                  >
                    <span className="font-medium text-ink">{job.title}</span>
                    <span className="ml-2 text-muted-foreground">{job.location}</span>
                  </Link>
                ))}
              {allJobs.filter(
                (job) =>
                  job.active !== false &&
                  (job.ownerId === profile.ownerId || job.employer === profile.name),
              ).length === 0 ? (
                <p className="text-sm text-muted-foreground">No active opportunities right now.</p>
              ) : null}
            </div>
          </section>
        </div>
      </Container>
    </SitePage>
  );
}
