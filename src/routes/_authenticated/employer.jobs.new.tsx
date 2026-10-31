import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Container, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { categories, employmentTypes, experienceLevels, schedules } from "@/lib/localstep/jobs";
import { useLocalStep } from "@/lib/localstep/store";
import type { EmploymentType, ExperienceLevel, JobCategory, OpportunityType, Schedule } from "@/lib/localstep/types";

export const Route = createFileRoute("/_authenticated/employer/jobs/new")({
  head: () => ({
    meta: [
      { title: "Post a job for students | LocalStep" },
      { name: "description", content: "Create a student-friendly job listing and preview exactly what students see." },
      { property: "og:title", content: "Post a job for students | LocalStep" },
      { property: "og:description", content: "Create a student-friendly job listing in a few minutes." },
    ],
  }),
  component: NewJobPage,
});

function NewJobPage() {
  const navigate = useNavigate();
  const { addEmployerJob, account } = useLocalStep();

  const [form, setForm] = useState({
    title: "",
    opportunityType: "job" as OpportunityType,
    employer: account?.businessName ?? "",
    description: "",
    category: "Retail" as JobCategory,
    location: "Barrington, IL",
    payMin: "15",
    payMax: "18",
    employmentType: "Part-time" as EmploymentType,
    schedule: "After school" as Schedule,
    minimumAge: "16",
    maximumAge: "",
    requiredSkills: "",
    tags: "",
    openings: "1",
    experience: "No experience required" as ExperienceLevel,
    deadline: "",
    contact: "",
    contactName: "",
    socialLinks: "",
    questions: "",
    requiresResume: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function publish(status: "draft" | "pending_review" = "pending_review") {
    if (!form.title.trim() || !form.employer.trim()) {
      toast.error("Add a job title and business name first.");
      return;
    }
    const id = `${form.title.toLowerCase().replace(/\W+/g, "-")}-${Date.now().toString(36)}`;
    addEmployerJob({
      id,
      opportunityType: form.opportunityType,
      title: form.title.trim(),
      employer: form.employer.trim(),
      employerBlurb: "Listing created in the LocalStep employer dashboard.",
      location: form.location,
      distanceMiles: 1.2,
      payMin: form.payMin ? Number(form.payMin) : null,
      payMax: form.payMax ? Number(form.payMax) : Number(form.payMin || 0),
      employmentType: form.employmentType,
      schedule: form.schedule,
      minimumAge: Number(form.minimumAge || 16),
      maximumAge: form.maximumAge ? Number(form.maximumAge) : null,
      requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      openings: Number(form.openings || 1),
      deadline: form.deadline || null,
      contactName: form.contactName || undefined,
      contactEmail: form.contact || undefined,
      socialLinks: form.socialLinks ? { links: form.socialLinks } : {},
      applicationQuestions: form.questions.split("\n").map((prompt, index) => ({ id: `q-${index}`, prompt: prompt.trim(), type: "long" as const, required: false })).filter((question) => question.prompt),
      experience: form.experience,
      category: form.category,
      summary: form.description.slice(0, 140) || "New listing from a local employer.",
      description: form.description || "No description provided yet.",
      responsibilities: ["Details will be shared by the employer."],
      lookingFor: ["Students who match the schedule and experience level above."],
      scheduleDetail: form.schedule,
      requirements: [
        `Must be ${form.minimumAge || 16} or older`,
        form.experience,
        form.deadline ? `Apply by ${form.deadline}` : "Applications open",
      ],
      postedDaysAgo: 0,
      demo: false,
      ownerId: account?.email.toLowerCase(),
      requiresResume: form.requiresResume,
    }, status);
    toast.success(status === "draft" ? "Draft saved" : "Job submitted for review");
    void navigate({ to: status === "draft" ? "/employer" : "/jobs/$jobId", params: status === "draft" ? {} : { jobId: id } });
  }

  const payLabel =
    form.payMin && form.payMax && form.payMin !== form.payMax
      ? `$${form.payMin}–${form.payMax}/hr`
      : form.payMin
        ? `$${form.payMin}/hr`
        : "Pay not listed";

  return (
    <SitePage>
      <Container className="py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/employer" className="hover:text-primary">
            Employer Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">New job</span>
        </nav>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Post an opportunity</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Students see the preview on the right exactly as you fill this in.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              publish("pending_review");
            }}
          >
            <section className="space-y-4 rounded-xl border border-border bg-surface p-6">
              <div>
                <Label htmlFor="opportunity-type">Opportunity type</Label>
                <Select value={form.opportunityType} onValueChange={(value) => set("opportunityType", value as OpportunityType)}>
                  <SelectTrigger id="opportunity-type" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[
                      ["job", "Job"],
                      ["internship", "Internship"],
                      ["volunteer", "Volunteering"],
                      ["scholarship", "Scholarship"],
                      ["college_program", "College Program"],
                      ["competition", "Competition"],
                    ].map(([value, label]) => <SelectItem key={value} value={value ?? "job"}>{label ?? "Job"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="job-title">Job title</Label>
                <Input
                  id="job-title"
                  className="mt-1.5"
                  value={form.title}
                  onChange={(event) => set("title", event.target.value)}
                  placeholder="Retail Associate"
                  required
                />
              </div>
              <div>
                <Label htmlFor="job-business">Business name</Label>
                <Input
                  id="job-business"
                  className="mt-1.5"
                  value={form.employer}
                  onChange={(event) => set("employer", event.target.value)}
                  placeholder="Neighborhood Market"
                  required
                />
              </div>
              <div>
                <Label htmlFor="job-description">Description</Label>
                <Textarea
                  id="job-description"
                  rows={5}
                  className="mt-1.5"
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  placeholder="What the student will do, and what a normal shift looks like."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="job-category">Category</Label>
                  <Select value={form.category} onValueChange={(value) => set("category", value as JobCategory)}>
                    <SelectTrigger id="job-category" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label htmlFor="job-min-age">Minimum age</Label><Input id="job-min-age" type="number" min="14" value={form.minimumAge} onChange={(event) => set("minimumAge", event.target.value)} /></div>
                  <div><Label htmlFor="job-max-age">Maximum age (optional)</Label><Input id="job-max-age" type="number" min="14" value={form.maximumAge} onChange={(event) => set("maximumAge", event.target.value)} /></div>
                  <div><Label htmlFor="job-deadline">Application deadline</Label><Input id="job-deadline" type="date" value={form.deadline} onChange={(event) => set("deadline", event.target.value)} /></div>
                  <div><Label htmlFor="job-openings">Openings</Label><Input id="job-openings" type="number" min="1" value={form.openings} onChange={(event) => set("openings", event.target.value)} /></div>
                  <div><Label htmlFor="job-skills">Required skills (comma separated)</Label><Input id="job-skills" value={form.requiredSkills} onChange={(event) => set("requiredSkills", event.target.value)} placeholder="Teamwork, Excel" /></div>
                  <div><Label htmlFor="job-tags">Tags (comma separated)</Label><Input id="job-tags" value={form.tags} onChange={(event) => set("tags", event.target.value)} placeholder="Local, Student-friendly" /></div>
                </div>
                <div>
                  <Label htmlFor="job-contact-name">Contact name</Label>
                  <Input id="job-contact-name" value={form.contactName} onChange={(event) => set("contactName", event.target.value)} placeholder="Alex Johnson" />
                </div>
                <div>
                  <Label htmlFor="job-location">Location</Label>
                  <Input
                    id="job-location"
                    className="mt-1.5"
                    value={form.location}
                    onChange={(event) => set("location", event.target.value)}
                  />
                </div>
                <div><Label htmlFor="job-social-links">Social links (optional)</Label><Input id="job-social-links" value={form.socialLinks} onChange={(event) => set("socialLinks", event.target.value)} placeholder="https://instagram.com/yourbusiness" /></div>
                <div className="sm:col-span-2"><Label htmlFor="job-questions">Optional application questions (one per line)</Label><Textarea id="job-questions" value={form.questions} onChange={(event) => set("questions", event.target.value)} placeholder="Why are you interested in this opportunity?" /></div>
              </div>
            </section>

            <section className="grid gap-4 rounded-xl border border-border bg-surface p-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="job-pay-min">Pay from ($/hr)</Label>
                <Input
                  id="job-pay-min"
                  className="mt-1.5"
                  inputMode="numeric"
                  value={form.payMin}
                  onChange={(event) => set("payMin", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="job-pay-max">Pay to ($/hr)</Label>
                <Input
                  id="job-pay-max"
                  className="mt-1.5"
                  inputMode="numeric"
                  value={form.payMax}
                  onChange={(event) => set("payMax", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="job-type">Employment type</Label>
                <Select
                  value={form.employmentType}
                  onValueChange={(value) => set("employmentType", value as EmploymentType)}
                >
                  <SelectTrigger id="job-type" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="job-schedule">Schedule</Label>
                <Select value={form.schedule} onValueChange={(value) => set("schedule", value as Schedule)}>
                  <SelectTrigger id="job-schedule" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="job-age">Minimum age</Label>
                <Input
                  id="job-age"
                  className="mt-1.5"
                  inputMode="numeric"
                  value={form.minimumAge}
                  onChange={(event) => set("minimumAge", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="job-experience">Experience requirement</Label>
                <Select value={form.experience} onValueChange={(value) => set("experience", value as ExperienceLevel)}>
                  <SelectTrigger id="job-experience" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="job-deadline">Application deadline</Label>
                <Input
                  id="job-deadline"
                  type="date"
                  className="mt-1.5"
                  value={form.deadline}
                  onChange={(event) => set("deadline", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="job-contact">Contact / application method</Label>
                <Input
                  id="job-contact"
                  className="mt-1.5"
                  value={form.contact}
                  onChange={(event) => set("contact", event.target.value)}
                  placeholder="Apply through LocalStep"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="job-requires-resume">Require a resume</Label>
                  <p className="mt-1 text-xs text-muted-foreground">Students will be asked to attach a resume before submitting.</p>
                </div>
                <Switch id="job-requires-resume" checked={form.requiresResume} onCheckedChange={(checked) => set("requiresResume", checked)} />
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => publish("draft")}>Save draft</Button>
              <Button type="submit">Submit for review</Button>
              <Button asChild variant="outline" type="button">
                <Link to="/employer">Cancel</Link>
              </Button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Student preview
            </p>
            <div className="mt-3 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-base font-semibold text-ink">{form.title || "Job title"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{form.employer || "Your business"}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {form.location} · {payLabel} · {form.schedule}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {form.description || "Your description will appear here."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{form.employmentType}</Badge>
                <Badge variant="secondary">{form.experience}</Badge>
                <Badge variant="secondary">Ages {form.minimumAge || 16}+</Badge>
              </div>
              <Button className="mt-5 w-full" type="button" disabled>
                Apply
              </Button>
            </div>
          </aside>
        </div>
      </Container>
    </SitePage>
  );
}
