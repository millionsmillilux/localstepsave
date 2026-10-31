import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStep } from "@/lib/localstep/store";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "My applications | LocalStep" },
      { name: "description", content: "Track the opportunities you've applied to on LocalStep." },
      { property: "og:title", content: "My applications | LocalStep" },
      { property: "og:description", content: "Track the opportunities you've applied to on LocalStep." },
    ],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { applications, allJobs, hydrated } = useLocalStep();

  return (
    <SitePage>
      <Container className="py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">My applications</h1>
        <p className="mt-2 text-sm text-muted-foreground">Every application you've sent through LocalStep.</p>

        <div className="mt-8">
          {!hydrated || applications.length === 0 ? (
            <EmptyState
              icon={<FileText className="mx-auto h-6 w-6" />}
              title="No applications yet"
              description="When you apply to an opportunity, it will show up here."
              action={
                <Button asChild>
                  <Link to="/jobs">Find Opportunities</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {applications.map((application) => {
                const job = allJobs.find((item) => item.id === application.jobId);
                if (!job) return null;
                return (
                  <li
                    key={application.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        to="/jobs/$jobId"
                        params={{ jobId: job.id }}
                        className="text-base font-semibold text-ink hover:text-primary"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.employer} · Applied {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="w-fit border-transparent bg-accent text-accent-foreground hover:bg-accent">
                      {application.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Container>
    </SitePage>
  );
}
