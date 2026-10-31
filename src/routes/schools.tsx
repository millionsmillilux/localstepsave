import { Link, createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
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

export const Route = createFileRoute("/schools")({
  staticData: { sitemap: true },
  head: () => ({ ...seoHead({ path: "/schools", title: "Student Portal for Schools & Youth Organizations | LocalStep", description: "Connect your students with local part-time jobs and internships through LocalStep. Track groups and share opportunities in one place." }) }),
  component: SchoolPortal,
});

const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, current: true },
  { label: "Student Groups", icon: Users, current: false },
  { label: "Shared Opportunities", icon: Send, current: false },
  { label: "Events", icon: CalendarDays, current: false },
  { label: "Resources", icon: BookOpen, current: false },
];

function SchoolPortal() {
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
                  {!item.current ? <Badge variant="secondary" className="ml-auto text-[10px]">Soon</Badge> : null}
                </span>
              ))}
            </nav>
            <p className="mt-3 px-3 text-xs text-muted-foreground">
              School workspaces are coming soon. This preview does not contain live school data.
            </p>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                  Welcome back, Barrington High School
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Connect students with opportunities and college-preparation resources. Live school workspaces are coming soon.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/contact">
                  <Plus className="mr-1.5 h-4 w-4" /> Request an invite
                </Link>
              </Button>
            </div>

            <div className="mt-8">
              <EmptyState
                icon={<GraduationCap className="mx-auto h-6 w-6" />}
                title="School workspaces are coming soon"
                description="LocalStep will connect groups, shared opportunities, events, and resources here once this portal is live."
                action={<Button asChild variant="outline"><Link to="/contact">Request an invite</Link></Button>}
              />
            </div>

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
