import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Building2,
  CreditCard,
  LayoutDashboard,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOpportunityMatch } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import type { ApplicationStatus } from "@/lib/localstep/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/employer/")({
  head: () => ({ meta: [{ title: "Employer dashboard | LocalStep" }] }),
  component: EmployerDashboard,
});

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Jobs", icon: BriefcaseBusiness },
  { label: "Applicants", icon: Users },
  { label: "Company Profile", icon: Building2 },
  { label: "Billing", icon: CreditCard },
];

function EmployerDashboard() {
  const {
    account,
    employerJobs: allEmployerJobs,
    allJobs,
    applications,
    hydrated,
    updateApplicationStatus,
    addApplicationNote,
    getBusinessProfile,
    updateBusinessProfile,
    submitVerification,
  } = useLocalStep();
  const businessName = account?.businessName ?? "Local Coffee Co.";
  const currentProfile = account ? getBusinessProfile(account.email) : undefined;
  const employerJobs = allEmployerJobs.filter(
    (job) => job.ownerId === account?.email.toLowerCase() || job.employer === businessName,
  );
  const [remoteStats, setRemoteStats] = useState<{
    active_jobs: number;
    pending_jobs: number;
    applicants: number;
    interviews: number;
    offers: number;
  } | null>(null);
  useEffect(() => {
    void supabase.rpc("employer_dashboard_counts").then(({ data }) => {
      if (data?.[0]) setRemoteStats(data[0]);
    });
  }, []);
  const stats = remoteStats ?? {
    active_jobs: employerJobs.filter((job) => job.active).length,
    applicants: applications.length,
    interviews: applications.filter((item) => item.status === "Interview").length,
    offers: applications.filter((item) => item.status === "Offer").length,
  };
  return (
    <SitePage>
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside>
            <nav aria-label="Employer" className="rounded-xl border border-border bg-surface p-2">
              {sidebarItems.map((item, index) => (
                <span
                  key={item.label}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${index === 0 ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              ))}
            </nav>
          </aside>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                  Good morning, {businessName}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Review your applicants and keep great students moving forward.
                </p>
              </div>
              <Button asChild>
                <Link to="/employer/jobs/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Post New Job
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Active Jobs", value: stats.active_jobs },
                { label: "Applicants", value: stats.applicants },
                { label: "Interviews", value: stats.interviews },
                { label: "Offers", value: stats.offers },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {hydrated ? stat.value : 0}
                  </p>
                </div>
              ))}
            </div>
            <section className="mt-8 space-y-3">
              <h2 className="font-semibold text-ink">Your opportunities</h2>
              {employerJobs.length ? (
                employerJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
                  >
                    <div>
                      <p className="font-medium text-ink">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.location} · {job.viewsCount ?? 0} views · {job.savesCount ?? 0} saves
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.moderationStatus === "active" ? "default" : "secondary"}>
                        {(job.moderationStatus ?? "draft").replace("_", " ")}
                      </Badge>
                      {job.moderationStatus === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void supabase
                              .from("opportunities")
                              .update({ status: "suspended" })
                              .eq("id", job.id)
                              .then(({ error }) =>
                                error
                                  ? toast.error(error.message)
                                  : toast.success("Opportunity closed"),
                              )
                          }
                        >
                          Close
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No opportunities yet.</p>
              )}
            </section>
            <ProfileEditor
              profile={currentProfile}
              update={updateBusinessProfile}
              submit={submitVerification}
            />
            <ApplicantPanel
              applications={applications}
              allJobs={allJobs}
              updateApplicationStatus={updateApplicationStatus}
              addApplicationNote={addApplicationNote}
            />
          </div>
        </div>
      </Container>
    </SitePage>
  );
}

function ProfileEditor({
  profile,
  update,
  submit,
}: {
  profile: ReturnType<ReturnType<typeof useLocalStep>["getBusinessProfile"]>;
  update: ReturnType<typeof useLocalStep>["updateBusinessProfile"];
  submit: () => void;
}) {
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    description: profile?.description ?? "",
    location: profile?.location ?? "",
    industry: profile?.industry ?? "",
    website: profile?.website ?? "",
    contactEmail: profile?.contactEmail ?? "",
    phone: profile?.phone ?? "",
    logoUrl: profile?.logoUrl ?? "",
  });
  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink">Business profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Build your public profile. Verification is reviewed by LocalStep admins.
          </p>
        </div>
        <Badge variant="secondary">
          {profile?.verificationStatus === "approved"
            ? "Verified"
            : profile?.verificationStatus === "pending"
              ? "Verification pending"
              : "Unverified"}
        </Badge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Business name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Industry"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
        />
        <Input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <Input
          placeholder="Logo URL"
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
        />
        <Input
          placeholder="Website"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
        <Input
          type="email"
          placeholder="Business email"
          value={form.contactEmail}
          onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
        />
        <Input
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Textarea
          className="sm:col-span-2"
          placeholder="Tell students about your business"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() =>
            void update(form)
              .then(() => toast.success("Profile saved"))
              .catch((error) =>
                toast.error(error instanceof Error ? error.message : "Could not save profile"),
              )
          }
        >
          Save profile
        </Button>
        {profile?.verificationStatus !== "pending" && profile?.verificationStatus !== "approved" ? (
          <Button variant="outline" disabled={!profile} onClick={submit}>
            Submit for verification
          </Button>
        ) : null}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Verification requires a business email, website, phone number, business name, and location.
        Missing:{" "}
        {[
          !form.contactEmail && "business email",
          !form.website && "website",
          !form.phone && "phone number",
          !form.name && "business name",
          !form.location && "location",
        ]
          .filter(Boolean)
          .join(", ") || "nothing"}
      </p>
      {profile?.verificationNotes ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Verification result: {profile.verificationNotes}
        </p>
      ) : null}
    </section>
  );
}

function ApplicantPanel({
  applications,
  allJobs,
  updateApplicationStatus,
  addApplicationNote,
}: {
  applications: ReturnType<typeof useLocalStep>["applications"];
  allJobs: ReturnType<typeof useLocalStep>["allJobs"];
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  addApplicationNote: (id: string, note: string) => void;
}) {
  const [filter, setFilter] = useState<"All" | ApplicationStatus>("All");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const filters: Array<"All" | ApplicationStatus> = [
    "All",
    "Submitted",
    "Viewed",
    "Under Review",
    "Interview",
    "Offer",
    "Accepted",
    "Not Selected",
  ];
  const visible = applications.filter((item) => filter === "All" || item.status === filter);
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Applicants</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open an applicant to review their profile, match, answers, and notes.
          </p>
        </div>
        <label className="text-sm text-muted-foreground">
          Filter
          <select
            className="ml-2 rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground"
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
          >
            {filters.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 space-y-3">
        {visible.length ? (
          visible.map((application) => {
            const job = allJobs.find((item) => item.id === application.jobId);
            if (!job) return null;
            const match = getOpportunityMatch(application.profileSnapshot, job);
            return (
              <details
                key={application.id}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">
                        {application.profileSnapshot.name || "Student applicant"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.title} · {application.matchScoreAtSubmission}% Match
                      </p>
                    </div>
                    <Badge className="border-transparent bg-accent text-accent-foreground">
                      {application.status}
                    </Badge>
                  </div>
                </summary>
                <div className="mt-5 grid gap-4 border-t border-border pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-ink">Student Profile</p>
                    <p className="mt-2 text-muted-foreground">
                      {application.profileSnapshot.school} · Class of{" "}
                      {application.profileSnapshot.graduationYear}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Skills: {application.profileSnapshot.skills.join(", ") || "Not provided"}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Interests:{" "}
                      {application.profileSnapshot.interests.join(", ") || "Not provided"}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Availability:{" "}
                      {application.profileSnapshot.availability.join(", ") || "Not provided"}
                    </p>
                    <p className="mt-3 font-medium text-primary">
                      {application.matchScoreAtSubmission}% Match
                    </p>{" "}
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {(match?.reasons ?? []).map((reason) => (
                        <li key={reason}>✓ {reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Application</p>
                    <p className="mt-2 text-muted-foreground">
                      {application.message || "No message added."}
                    </p>
                  </div>
                </div>{" "}
                <div className="mt-5 flex flex-wrap gap-2">
                  {(
                    [
                      "Viewed",
                      "Under Review",
                      "Interview",
                      "Offer",
                      "Accepted",
                      "Not Selected",
                    ] as ApplicationStatus[]
                  ).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={application.status === status ? "default" : "outline"}
                      onClick={() => updateApplicationStatus(application.id, status)}
                    >
                      {status === "Viewed"
                        ? "Mark as Viewed"
                        : status === "Not Selected"
                          ? "Mark Not Selected"
                          : `Move to ${status}`}
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {application.status === "Accepted"
                    ? "Marked as hired — this counts as a successful hire, so the LocalStep hire fee applies. Billing is coming soon."
                    : "Moving an applicant to Accepted marks them as hired. LocalStep charges a one-time fee only for successful hires."}
                </p>
                <div className="mt-4 flex gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Add private note"
                    value={notes[application.id] ?? ""}
                    onChange={(event) =>
                      setNotes((prev) => ({ ...prev, [application.id]: event.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      addApplicationNote(application.id, notes[application.id] ?? "");
                      setNotes((prev) => ({ ...prev, [application.id]: "" }));
                    }}
                  >
                    Add Note
                  </Button>
                </div>
                {application.notes.length ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Private notes: {application.notes.join(" · ")}
                  </p>
                ) : null}
              </details>
            );
          })
        ) : (
          <EmptyState
            icon={<Users className="mx-auto h-6 w-6" />}
            title="No applicants yet"
            description="Share your opportunity with local students to start receiving applications."
            action={
              <Button asChild variant="outline">
                <Link to="/employer/jobs/new">View Listing</Link>
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}
