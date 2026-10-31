import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Building2,
  CreditCard,
  LayoutDashboard,
  Plus,
  Users,
  Search,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useState } from "react";

import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOpportunityMatch, getStudentOpportunityMatches } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import type { ApplicationStatus } from "@/lib/localstep/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/employer/")({
  staticData: { sitemap: false },
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
    applications: liveApplications,
    demoApplications,
    businessProfiles,
    updateApplicationStatus,
    addApplicationNote,
    getBusinessProfile,
    updateBusinessProfile,
    submitVerification,
    demoStudents,
    isDemoStudentSaved,
    toggleDemoStudentSaved,
    createDemoJob,
    updateDemoJob,
    deleteDemoJob,
    updateDemoBusinessProfile,
  } = useLocalStep();
  const businessName = account?.businessName ?? "Local Coffee Co.";
  const currentProfile =
    (account ? getBusinessProfile(account.email) : undefined) ??
    businessProfiles.find((profile) => profile.id.startsWith("demo-"));
  const employerJobs = allEmployerJobs.filter(
    (job) => job.ownerId === account?.email.toLowerCase() || job.employer === businessName,
  );
  const [studentQuery, setStudentQuery] = useState("");
  const [studentInterest, setStudentInterest] = useState("");
  const [studentSkill, setStudentSkill] = useState("");
  const [studentAvailability, setStudentAvailability] = useState("");
  const [studentExperience, setStudentExperience] = useState("");
  const [selectedDemoJobId, setSelectedDemoJobId] = useState("");
  const [activeSection, setActiveSection] = useState("Overview");
  const demoListings = allJobs.filter((job) => job.demo);
  const demoMetrics = {
    active_jobs: demoListings.filter((job) => job.active !== false).length,
    applicants: demoApplications.length,
    matches: demoStudents.length,
    interviews: demoApplications.filter((item) =>
      ["Interview", "Offer", "Accepted"].includes(item.status),
    ).length,
    hires: demoApplications.filter((item) => ["Offer", "Accepted"].includes(item.status)).length,
  };
  const managedJobs = [...demoListings, ...employerJobs.filter((job) => !job.demo)];
  const selectedDemoJob =
    demoListings.find((job) => job.id === selectedDemoJobId) ?? demoListings[0];
  const filteredStudents = demoStudents
    .map((student) => ({
      student,
      match: selectedDemoJob ? getOpportunityMatch(student.profile, selectedDemoJob) : null,
    }))
    .filter(({ student, match }) => {
      const text = [
        student.profile.name,
        student.profile.bio,
        student.profile.interests.join(" "),
        student.profile.skills.join(" "),
        student.profile.experience,
        student.profile.availability.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!studentQuery || text.includes(studentQuery.toLowerCase())) &&
        (!studentInterest ||
          student.profile.interests.some((value) =>
            value.toLowerCase().includes(studentInterest.toLowerCase()),
          )) &&
        (!studentSkill ||
          student.profile.skills.some((value) =>
            value.toLowerCase().includes(studentSkill.toLowerCase()),
          )) &&
        (!studentAvailability ||
          student.profile.availability.some((value) =>
            value.toLowerCase().includes(studentAvailability.toLowerCase()),
          )) &&
        (!studentExperience ||
          student.profile.experience.toLowerCase().includes(studentExperience.toLowerCase())) &&
        match
      );
    })
    .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  return (
    <SitePage>
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside>
            <nav aria-label="Employer" className="rounded-xl border border-border bg-surface p-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveSection(item.label)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm ${activeSection === item.label ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
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
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Active listings", value: demoMetrics.active_jobs },
                { label: "Applicants", value: demoMetrics.applicants },
                { label: "Student matches", value: demoMetrics.matches },
                { label: "Interviews", value: demoMetrics.interviews },
                { label: "Hires", value: demoMetrics.hires },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.label}
                  size="sm"
                  variant={activeSection === item.label ? "default" : "outline"}
                  onClick={() => setActiveSection(item.label)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            {activeSection === "Jobs" ? (
              <JobManagement
                jobs={managedJobs}
                businessName={currentProfile?.name ?? businessName}
                create={createDemoJob}
                update={updateDemoJob}
                remove={deleteDemoJob}
              />
            ) : null}
            {activeSection === "Billing" ? <BillingPanel applications={demoApplications} /> : null}
            {activeSection === "Applicants" ? (
              <PipelinePanel applications={demoApplications} allJobs={allJobs} />
            ) : null}
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
              updateDemo={updateDemoBusinessProfile}
              submit={submitVerification}
            />
            <ApplicantPanel
              applications={[...demoApplications, ...liveApplications]}
              allJobs={allJobs}
              updateApplicationStatus={updateApplicationStatus}
              addApplicationNote={addApplicationNote}
            />
            <DemoStudentDiscovery
              listings={demoListings}
              selectedJob={selectedDemoJob}
              selectedJobId={selectedDemoJobId}
              setSelectedJobId={setSelectedDemoJobId}
              students={filteredStudents}
              query={studentQuery}
              setQuery={setStudentQuery}
              interest={studentInterest}
              setInterest={setStudentInterest}
              skill={studentSkill}
              setSkill={setStudentSkill}
              availability={studentAvailability}
              setAvailability={setStudentAvailability}
              experience={studentExperience}
              setExperience={setStudentExperience}
              isSaved={isDemoStudentSaved}
              toggleSaved={toggleDemoStudentSaved}
            />
          </div>
        </div>
      </Container>
    </SitePage>
  );
}

function JobManagement({
  jobs,
  businessName,
  create,
  update,
  remove,
}: {
  jobs: ReturnType<typeof useLocalStep>["allJobs"];
  businessName: string;
  create: ReturnType<typeof useLocalStep>["createDemoJob"];
  update: ReturnType<typeof useLocalStep>["updateDemoJob"];
  remove: ReturnType<typeof useLocalStep>["deleteDemoJob"];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const demoJobs = jobs.filter((job) => job.demo);
  const save = () => {
    if (!title.trim()) return;
    if (editingId)
      update(editingId, {
        title: `${title.trim()} (DEMO)`,
        description: description || "Fictional demo listing updated during this session.",
        summary: description || "Fictional demo listing updated during this session.",
      });
    else
      create({
        id: `demo-job-custom-${Date.now()}`,
        opportunityType: "job",
        title: `${title.trim()} (DEMO)`,
        employer: businessName,
        employerBlurb: "Fictional demo employer profile.",
        location: "Barrington, IL",
        distanceMiles: 1,
        payMin: 15,
        payMax: 18,
        employmentType: "Part-time",
        schedule: "Flexible",
        minimumAge: 16,
        experience: "Training provided",
        category: "Community",
        summary: description || "Fictional demo listing.",
        description: description || "Fictional demo listing created during this demo session.",
        responsibilities: ["Support the team with a mentor"],
        lookingFor: ["Reliable and curious students"],
        scheduleDetail: "Flexible demo schedule",
        requirements: ["Demo listing only"],
        tags: ["DEMO"],
        active: true,
        moderationStatus: "active",
        postedDaysAgo: 0,
        demo: true,
        openings: 1,
        viewsCount: 0,
        savesCount: 0,
      });
    setTitle("");
    setDescription("");
    setEditingId(null);
  };
  return (
    <section className="mt-8 rounded-2xl border border-primary/20 bg-accent/20 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Job management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage fictional listings. Changes persist for this demo session only.
          </p>
        </div>
        <Badge variant="outline">DEMO</Badge>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
        <Input
          placeholder="Listing title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Button onClick={save}>{editingId ? "Save edits" : "Create listing"}</Button>
      </div>
      {editingId ? (
        <Button
          className="mt-2"
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditingId(null);
            setTitle("");
            setDescription("");
          }}
        >
          Cancel edit
        </Button>
      ) : null}
      <div className="mt-5 space-y-2">
        {demoJobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
          >
            <div>
              <p className="font-medium text-ink">{job.title}</p>
              <p className="text-xs text-muted-foreground">
                {job.employer} · {job.location} · {job.active === false ? "Paused" : "Active"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={job.active === false ? "secondary" : "default"}>
                {job.active === false ? "Paused" : "Active"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingId(job.id);
                  setTitle(job.title.replace(/ \(DEMO\)$/, ""));
                  setDescription(job.description);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update(job.id, {
                    active: job.active === false,
                    moderationStatus: job.active === false ? "active" : "suspended",
                  })
                }
              >
                {job.active === false ? "Reactivate" : "Pause"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(job.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PipelinePanel({
  applications,
  allJobs,
}: {
  applications: ReturnType<typeof useLocalStep>["demoApplications"];
  allJobs: ReturnType<typeof useLocalStep>["allJobs"];
}) {
  const stages: Array<{ label: string; statuses: ApplicationStatus[] }> = [
    { label: "New", statuses: ["Submitted", "Viewed"] },
    { label: "Reviewing", statuses: ["Under Review"] },
    { label: "Interview", statuses: ["Interview"] },
    { label: "Hired", statuses: ["Offer", "Accepted"] },
    { label: "Rejected", statuses: ["Not Selected"] },
  ];
  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Hiring pipeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fictional applicant stages update as you change statuses in the inbox.
          </p>
        </div>
        <Badge variant="outline">DEMO</Badge>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {stages.map((stage) => {
          const items = applications.filter((application) =>
            stage.statuses.includes(application.status),
          );
          return (
            <div
              key={stage.label}
              className="min-h-32 rounded-lg border border-border bg-surface-sunken p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{stage.label}</p>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {items.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-md border border-border bg-surface p-2 text-xs"
                  >
                    <p className="font-medium text-ink">{application.profileSnapshot.name}</p>
                    <p className="mt-1 text-muted-foreground">
                      {allJobs.find((job) => job.id === application.jobId)?.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BillingPanel({
  applications,
}: {
  applications: ReturnType<typeof useLocalStep>["demoApplications"];
}) {
  const hired = applications.filter((application) =>
    ["Offer", "Accepted"].includes(application.status),
  );
  const fee = hired.length * 29.99;
  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Hiring fees</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            $29.99 one-time fee per employee hired. This is a sample breakdown; no payment is
            processed.
          </p>
        </div>
        <Badge variant="outline">DEMO BILLING</Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Demo hires</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{hired.length}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Fee per hire</p>
          <p className="mt-2 text-2xl font-semibold text-ink">$29.99</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Sample total</p>
          <p className="mt-2 text-2xl font-semibold text-ink">${fee.toFixed(2)}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Simulated only. No card, invoice, subscription, or real business charge is created.
      </p>
    </section>
  );
}

function ProfileEditor({
  profile,
  update,
  updateDemo,
  submit,
}: {
  profile: ReturnType<ReturnType<typeof useLocalStep>["getBusinessProfile"]>;
  update: ReturnType<typeof useLocalStep>["updateBusinessProfile"];
  updateDemo: ReturnType<typeof useLocalStep>["updateDemoBusinessProfile"];
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
            (profile?.id.startsWith("demo-")
              ? Promise.resolve(updateDemo(profile.id, form))
              : update(form)
            )
              .then(() => toast.success("Demo profile saved for this session"))
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
                      ["Submitted", "New"],
                      ["Under Review", "Reviewing"],
                      ["Interview", "Interview"],
                      ["Accepted", "Hired"],
                      ["Not Selected", "Rejected"],
                    ] as Array<[ApplicationStatus, string]>
                  ).map(([status, label]) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={application.status === status ? "default" : "outline"}
                      onClick={() => updateApplicationStatus(application.id, status)}
                    >
                      {label}
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

function DemoStudentDiscovery({
  listings,
  selectedJob,
  selectedJobId,
  setSelectedJobId,
  students,
  query,
  setQuery,
  interest,
  setInterest,
  skill,
  setSkill,
  availability,
  setAvailability,
  experience,
  setExperience,
  isSaved,
  toggleSaved,
}: {
  listings: ReturnType<typeof useLocalStep>["allJobs"];
  selectedJob?: ReturnType<typeof useLocalStep>["allJobs"][number] | undefined;
  selectedJobId: string;
  setSelectedJobId: (value: string) => void;
  students: Array<{
    student: ReturnType<typeof useLocalStep>["demoStudents"][number];
    match: ReturnType<typeof getOpportunityMatch>;
  }>;
  query: string;
  setQuery: (value: string) => void;
  interest: string;
  setInterest: (value: string) => void;
  skill: string;
  setSkill: (value: string) => void;
  availability: string;
  setAvailability: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
}) {
  return (
    <section className="mt-10 rounded-2xl border border-primary/20 bg-accent/20 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-ink">Demo student discovery</h2>
            <Badge variant="outline">DEMO</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Find fictional student profiles that fit a sample listing. These profiles are for
            product demonstration only; no one has applied or been hired.
          </p>
        </div>
        <label className="text-sm font-medium text-ink">
          Match for listing
          <select
            className="mt-1 block min-w-64 rounded-md border border-border bg-surface px-3 py-2 text-sm font-normal"
            value={selectedJobId}
            onChange={(event) => setSelectedJobId(event.target.value)}
          >
            <option value="">Choose a demo listing</option>
            {listings.map((job) => (
              <option key={job.id} value={job.id}>
                {job.employer} - {job.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {selectedJob ? (
        <p className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
          Showing best fits for <span className="font-medium text-ink">{selectedJob.title}</span>.
          Scores use interests, skills, experience, career goals, availability, age, and location.
        </p>
      ) : null}
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name or profile"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Input
          placeholder="Interest"
          value={interest}
          onChange={(event) => setInterest(event.target.value)}
        />
        <Input
          placeholder="Skill"
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
        />
        <Input
          placeholder="Availability"
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="Experience keyword"
          value={experience}
          onChange={(event) => setExperience(event.target.value)}
        />
        <span className="self-center text-xs text-muted-foreground">
          {students.length} fictional profile{students.length === 1 ? "" : "s"} found
        </span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {students.map(({ student, match }) => {
          const topOpportunities = getStudentOpportunityMatches(student.profile, listings).slice(
            0,
            3,
          );
          const saved = isSaved(student.id);
          return (
            <details key={student.id} className="rounded-xl border border-border bg-surface p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{student.profile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.profile.school} · {student.profile.experience}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {match ? (
                      <Badge className="bg-primary text-primary-foreground">
                        {match.score}% Match
                      </Badge>
                    ) : null}
                    <Badge variant="outline">DEMO</Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{student.profile.bio}</p>
              </summary>
              <div className="mt-4 border-t border-border pt-4 text-sm">
                <p>
                  <span className="font-medium text-ink">Interests:</span>{" "}
                  {student.profile.interests.join(", ")}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-ink">Skills:</span>{" "}
                  {student.profile.skills.join(", ")}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-ink">Availability:</span>{" "}
                  {student.profile.availability.join(", ")}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-ink">Activities:</span>{" "}
                  {student.activities.map((activity) => activity.title).join(", ")}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-ink">Achievements:</span>{" "}
                  {student.achievements.map((achievement) => achievement.title).join(", ")}
                </p>
                {match ? (
                  <div className="mt-3 rounded-lg bg-surface-sunken p-3">
                    <p className="font-medium text-ink">Why this matches</p>
                    <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                      {match.reasons.map((reason) => (
                        <li key={reason}>✓ {reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-3">
                  <p className="font-medium text-ink">Matching demo opportunities</p>
                  <div className="mt-1 space-y-1">
                    {topOpportunities.map(({ job: opportunity, match: opportunityMatch }) => (
                      <Link
                        key={opportunity.id}
                        to="/jobs/$jobId"
                        params={{ jobId: opportunity.id }}
                        className="flex items-center justify-between rounded-md px-2 py-1 text-xs text-primary hover:bg-accent"
                      >
                        <span>{opportunity.title}</span>
                        <span>{opportunityMatch.score}%</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <Button
                  className="mt-3"
                  size="sm"
                  variant={saved ? "default" : "outline"}
                  onClick={() => toggleSaved(student.id)}
                >
                  {saved ? (
                    <BookmarkCheck className="mr-1 h-4 w-4" />
                  ) : (
                    <Bookmark className="mr-1 h-4 w-4" />
                  )}
                  {saved ? "Saved in demo" : "Save student"}
                </Button>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
