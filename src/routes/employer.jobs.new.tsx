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
import { categories, employmentTypes, experienceLevels, schedules } from "@/lib/localstep/jobs";
import { useLocalStep } from "@/lib/localstep/store";
import type { EmploymentType, ExperienceLevel, JobCategory, Schedule } from "@/lib/localstep/types";

export const Route = createFileRoute("/employer/jobs/new")({
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
    employer: account?.businessName ?? "",
    description: "",
    category: "Retail" as JobCategory,
    location: "Barrington, IL",
    payMin: "15",
    payMax: "18",
    employmentType: "Part-time" as EmploymentType,
    schedule: "After school" as Schedule,
    minimumAge: "16",
    experience: "No experience required" as ExperienceLevel,
    deadline: "",
    contact: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function publish() {
    if (!form.title.trim() || !form.employer.trim()) {
      toast.error("Add a job title and business name first.");
      return;
    }
    const id = `${form.title.toLowerCase().replace(/\W+/g, "-")}-${Date.now().toString(36)}`;
    addEmployerJob({
      id,
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
    });
    toast.success("Job published");
    void navigate({ to: "/jobs/$jobId", params: { jobId: id } });
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

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Post a job</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Students see the preview on the right exactly as you fill this in.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              publish();
            }}
          >
            <section className="space-y-4 rounded-xl border border-border bg-surface p-6">
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
                <div>
                  <Label htmlFor="job-location">Location</Label>
                  <Input
                    id="job-location"
                    className="mt-1.5"
                    value={form.location}
                    onChange={(event) => set("location", event.target.value)}
                  />
                </div>
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
            </section>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">Publish Job</Button>
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
