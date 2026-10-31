import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";

import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { formatPay } from "@/lib/localstep/jobs";
import { useLocalStep } from "@/lib/localstep/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved opportunities | LocalStep" },
      { name: "description", content: "Opportunities you saved to come back to later." },
      { property: "og:title", content: "Saved opportunities | LocalStep" },
      { property: "og:description", content: "Opportunities you saved to come back to later." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { saved, allJobs, removeSaved, hydrated } = useLocalStep();
  const rows = saved
    .map((entry) => ({ entry, job: allJobs.find((job) => job.id === entry.jobId) }))
    .filter((row): row is { entry: (typeof saved)[number]; job: NonNullable<(typeof allJobs)[number]> } =>
      Boolean(row.job),
    );

  return (
    <SitePage>
      <Container className="py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Saved opportunities</h1>
        <p className="mt-2 text-sm text-muted-foreground">Come back to these whenever you're ready to apply.</p>

        <div className="mt-8">
          {!hydrated || rows.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="mx-auto h-6 w-6" />}
              title="Nothing saved yet."
              description="Save opportunities you want to come back to later."
              action={
                <Button asChild>
                  <Link to="/jobs">Browse Opportunities</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {rows.map(({ entry, job }) => (
                <li
                  key={job.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      to="/jobs/$jobId"
                      params={{ jobId: job.id }}
                      className="text-base font-semibold text-ink hover:text-primary"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{job.employer}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {job.distanceMiles} mi away · {formatPay(job)} · {job.schedule}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Saved {new Date(entry.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSaved(job.id)}
                      aria-label={`Remove ${job.title} from saved`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </SitePage>
  );
}
