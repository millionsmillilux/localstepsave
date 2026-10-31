import { Link, createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Container, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStep } from "@/lib/localstep/store";
import type { CollegeApplication, CollegeApplicationStatus } from "@/lib/localstep/types";

export const Route = createFileRoute("/college-applications")({
  staticData: { sitemap: true },
  head: () => ({
    ...seoHead({
      path: "/college-applications",
      title: "College Application Organizer | LocalStep",
      description: "Organize college research, requirements, essays, and deadlines in LocalStep.",
    }),
  }),
  component: CollegeApplicationsPage,
});

const statuses: CollegeApplicationStatus[] = [
  "Researching",
  "Interested",
  "Applying",
  "Submitted",
  "Decision received",
];

function CollegeApplicationsPage() {
  const { colleges, account, saveCollege, deleteCollege, toggleCollegeRequirement } =
    useLocalStep();
  const [editing, setEditing] = useState<CollegeApplication | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const sorted = [...colleges].sort((a, b) =>
    (a.deadline || "9999").localeCompare(b.deadline || "9999"),
  );
  const compareSchools = colleges.filter((college) => compareIds.includes(college.id));

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(college: CollegeApplication) {
    setEditing(college);
    setShowForm(true);
  }
  async function remove(college: CollegeApplication) {
    if (!window.confirm(`Remove ${college.schoolName} from your organizer?`)) return;
    await deleteCollege(college.id);
    setCompareIds((ids) => ids.filter((id) => id !== college.id));
    toast.success("College removed");
  }

  return (
    <SitePage>
      <Container className="py-10">
        <Link
          to="/my-steps"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Steps
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-primary">College preparation</p>
              {!account ? <Badge variant="secondary">DEMO MODE · fictional schools</Badge> : null}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Your college application organizer
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Keep research, requirements, essays, recommendations, and verified deadlines in one
              calm workspace.
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Add a college
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Schools tracked" value={colleges.length} />
          <SummaryCard
            label="Requirements left"
            value={colleges.reduce(
              (total, college) =>
                total + college.requirements.filter((item) => !item.completed).length,
              0,
            )}
          />
          <SummaryCard label="Next deadline" value={sorted[0]?.deadline || "Add a date"} />
        </div>

        {showForm ? (
          <CollegeForm
            initial={editing}
            defaultDemo={!account}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSave={async (value) => {
              await saveCollege(value, editing?.id);
              setShowForm(false);
              setEditing(null);
              toast.success(editing ? "College updated" : "College added");
            }}
          />
        ) : null}

        <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">Saved colleges</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the status and checklist to see what needs attention next.
              </p>
            </div>
            {compareSchools.length >= 2 ? (
              <Badge variant="outline">Comparing {compareSchools.length} schools</Badge>
            ) : null}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {sorted.length ? (
              sorted.map((college) => {
                const completed = college.requirements.filter((item) => item.completed).length;
                const progress = college.requirements.length
                  ? Math.round((completed / college.requirements.length) * 100)
                  : 0;
                return (
                  <article key={college.id} className="rounded-xl border border-border p-5">
                    <div className="flex items-start gap-3">
                      <input
                        aria-label={`Compare ${college.schoolName}`}
                        type="checkbox"
                        checked={compareIds.includes(college.id)}
                        onChange={() =>
                          setCompareIds((ids) =>
                            ids.includes(college.id)
                              ? ids.filter((id) => id !== college.id)
                              : [...ids, college.id].slice(-3),
                          )
                        }
                        className="mt-1 h-4 w-4 accent-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-ink">{college.schoolName}</h3>
                          {college.demo ? <Badge variant="secondary">DEMO</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {college.location} · {college.status}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(college)}
                          aria-label={`Edit ${college.schoolName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => void remove(college)}
                          aria-label={`Remove ${college.schoolName}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span>Checklist progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="mt-2 h-2" />
                    <div className="mt-4 space-y-2">
                      {college.requirements.map((requirement) => (
                        <label key={requirement.id} className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={requirement.completed}
                            onChange={() =>
                              void toggleCollegeRequirement(college.id, requirement.id)
                            }
                            className="mt-0.5 h-4 w-4 accent-primary"
                          />
                          <span
                            className={
                              requirement.completed
                                ? "text-muted-foreground line-through"
                                : "text-ink"
                            }
                          >
                            {requirement.title}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Deadline
                        </p>
                        <p className="mt-1 font-medium text-ink">
                          {college.deadline || "Not entered"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Essay
                        </p>
                        <p className="mt-1 text-ink">{college.essayStatus}</p>
                      </div>
                    </div>
                    <details className="mt-4 rounded-lg bg-secondary/50 p-3 text-sm">
                      <summary className="cursor-pointer font-medium text-ink">
                        Open notes and requirements
                      </summary>
                      <div className="mt-3 space-y-2 text-muted-foreground">
                        <p>
                          <strong className="text-ink">Essay prompt:</strong>{" "}
                          {college.essayPrompt || "Not entered"}
                        </p>
                        <p>
                          <strong className="text-ink">Recommendations:</strong>{" "}
                          {college.recommendationNotes || "Not entered"}
                        </p>
                        <p>
                          <strong className="text-ink">Testing:</strong>{" "}
                          {college.testRequirements || "Not entered"}
                        </p>
                        <p>
                          <strong className="text-ink">Notes:</strong>{" "}
                          {college.notes || "Not entered"}
                        </p>
                        {college.website ? (
                          <a
                            href={college.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            Open official site <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </details>
                  </article>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center sm:col-span-2">
                <ClipboardList className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 font-semibold text-ink">Start your college list</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add schools and enter requirements from their official admissions pages.
                </p>
                <Button className="mt-4" onClick={openNew}>
                  Add your first college
                </Button>
              </div>
            )}
          </div>
        </section>

        {compareSchools.length >= 2 ? (
          <Comparison schools={compareSchools} />
        ) : (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Select two or three schools above to compare them.
          </p>
        )}
        {!account ? (
          <p className="mt-8 rounded-xl border border-warning/30 bg-warning-soft/40 p-4 text-sm text-foreground">
            <strong>DEMO MODE:</strong> These schools and dates are fictional examples. Verify every
            requirement and deadline on each official admissions website.
          </p>
        ) : null}
      </Container>
    </SitePage>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function CollegeForm({
  initial,
  defaultDemo,
  onSave,
  onCancel,
}: {
  initial: CollegeApplication | null;
  defaultDemo: boolean;
  onSave: (value: Omit<CollegeApplication, "id" | "updatedAt">) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState({
    schoolName: initial?.schoolName ?? "",
    location: initial?.location ?? "",
    website: initial?.website ?? "",
    status: initial?.status ?? ("Researching" as CollegeApplicationStatus),
    deadline: initial?.deadline ?? "",
    essayPrompt: initial?.essayPrompt ?? "",
    essayStatus: initial?.essayStatus ?? ("Not started" as CollegeApplication["essayStatus"]),
    recommendationNotes: initial?.recommendationNotes ?? "",
    testRequirements: initial?.testRequirements ?? "",
    notes: initial?.notes ?? "",
    requirements: initial?.requirements.map((item) => item.title).join(", ") ?? "",
  });
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.schoolName.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...value,
        requirements: value.requirements
          .split(",")
          .map((title, index) => ({
            id: initial?.requirements[index]?.id ?? `requirement-${Date.now()}-${index}`,
            title: title.trim(),
            completed: initial?.requirements[index]?.completed ?? false,
          }))
          .filter((item) => item.title),
        demo: initial?.demo ?? defaultDemo,
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-8 rounded-2xl border border-primary/20 bg-accent/20 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">
            {initial ? "Edit college" : "Add a college"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter information from the school’s official admissions materials.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label>School name</Label>
          <Input
            className="mt-1.5"
            value={value.schoolName}
            onChange={(e) => setValue({ ...value, schoolName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Location</Label>
          <Input
            className="mt-1.5"
            value={value.location}
            onChange={(e) => setValue({ ...value, location: e.target.value })}
            placeholder="City, state"
          />
        </div>
        <div>
          <Label>Official website</Label>
          <Input
            className="mt-1.5"
            type="url"
            value={value.website}
            onChange={(e) => setValue({ ...value, website: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Application deadline</Label>
          <Input
            className="mt-1.5"
            type="date"
            value={value.deadline}
            onChange={(e) => setValue({ ...value, deadline: e.target.value })}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={value.status}
            onValueChange={(status: CollegeApplicationStatus) => setValue({ ...value, status })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Essay status</Label>
          <Select
            value={value.essayStatus}
            onValueChange={(essayStatus: CollegeApplication["essayStatus"]) =>
              setValue({ ...value, essayStatus })
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Not started", "Drafting", "Ready"].map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Requirements (comma separated)</Label>
          <Input
            className="mt-1.5"
            value={value.requirements}
            onChange={(e) => setValue({ ...value, requirements: e.target.value })}
            placeholder="Application form, Personal statement, Recommendation letter"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Essay prompt</Label>
          <Textarea
            className="mt-1.5"
            value={value.essayPrompt}
            onChange={(e) => setValue({ ...value, essayPrompt: e.target.value })}
          />
        </div>
        <div>
          <Label>Recommendation notes</Label>
          <Textarea
            className="mt-1.5"
            value={value.recommendationNotes}
            onChange={(e) => setValue({ ...value, recommendationNotes: e.target.value })}
          />
        </div>
        <div>
          <Label>Testing requirements</Label>
          <Textarea
            className="mt-1.5"
            value={value.testRequirements}
            onChange={(e) => setValue({ ...value, testRequirements: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Textarea
            className="mt-1.5"
            value={value.notes}
            onChange={(e) => setValue({ ...value, notes: e.target.value })}
          />
        </div>
      </div>
      <Button className="mt-5" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save college"}
      </Button>
    </form>
  );
}

function Comparison({ schools }: { schools: CollegeApplication[] }) {
  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold text-ink">College comparison</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A side-by-side workspace for your saved schools. It does not verify admissions
            information.
          </p>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {schools.map((school) => (
                <th key={school.id} className="p-3 font-semibold text-ink">
                  {school.schoolName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Status", (school: CollegeApplication) => school.status],
              ["Deadline", (school: CollegeApplication) => school.deadline || "Not entered"],
              [
                "Requirements",
                (school: CollegeApplication) =>
                  `${school.requirements.filter((item) => item.completed).length}/${school.requirements.length} complete`,
              ],
              ["Essay", (school: CollegeApplication) => school.essayStatus],
              ["Testing", (school: CollegeApplication) => school.testRequirements || "Not entered"],
            ].map(([label, value]) => (
              <tr key={label as string} className="border-b border-border last:border-0">
                <th className="p-3 font-medium text-muted-foreground">{label as string}</th>
                {schools.map((school) => (
                  <td key={school.id} className="p-3 text-ink">
                    {(value as (school: CollegeApplication) => string)(school)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
