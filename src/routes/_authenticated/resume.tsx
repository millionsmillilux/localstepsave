import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudOff,
  Download,
  FileText,
  Lightbulb,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Container, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { rewriteBullets } from "@/lib/localstep/resume-ai.functions";
import {
  ENTRY_CATEGORIES,
  buildResumeDoc,
  newEntryId,
  prepareResumeDraft,
  tidyBullet,
  type ResumeDoc,
} from "@/lib/localstep/resume-doc";
import { downloadResume } from "@/lib/localstep/resume-export";
import { useLocalStep } from "@/lib/localstep/store";
import type { ResumeEntry, ResumeEntryCategory, ResumeTemplate, StudentResume } from "@/lib/localstep/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({
    meta: [
      { title: "Resume Builder | LocalStep" },
      { name: "description", content: "Build a professional student resume step by step and download it as a PDF or Word file." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResumePage,
});

const STEPS = ["Contact & school", "Experiences", "Skills & awards", "Summary", "Template & download"] as const;
type SaveStatus = "idle" | "saving" | "saved" | "error";

function ResumePage() {
  const { profile, resume, account, hydrated, saveResume } = useLocalStep();
  const [draft, setDraft] = useState<StudentResume | null>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const lastSaved = useRef<string>("");

  // Start from the saved resume, filling gaps from the profile.
  useEffect(() => {
    if (!hydrated || draft) return;
    const prepared = prepareResumeDraft(resume, profile);
    if (!prepared.contact?.email && account?.email) prepared.contact = { ...prepared.contact, email: account.email };
    lastSaved.current = JSON.stringify(resume.entries ? resume : null);
    setDraft(prepared);
  }, [hydrated, draft, resume, profile, account]);

  // Autosave about a second after the last change; only reports "Saved" after the database confirms.
  useEffect(() => {
    if (!draft) return;
    const snapshot = JSON.stringify({ ...draft, updatedAt: "" });
    if (snapshot === lastSaved.current) return;
    const timer = window.setTimeout(() => {
      setStatus("saving");
      saveResume(draft)
        .then(() => {
          lastSaved.current = snapshot;
          setStatus("saved");
        })
        .catch(() => setStatus("error"));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [draft, saveResume]);

  const doc = useMemo(() => (draft ? buildResumeDoc(draft) : null), [draft]);

  if (!draft || !doc) {
    return (
      <SitePage>
        <Container className="flex items-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your resume…
        </Container>
      </SitePage>
    );
  }

  const update = (patch: Partial<StudentResume>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const retry = () => {
    setStatus("saving");
    saveResume(draft)
      .then(() => {
        lastSaved.current = JSON.stringify({ ...draft, updatedAt: "" });
        setStatus("saved");
      })
      .catch(() => setStatus("error"));
  };

  return (
    <SitePage>
      <Container className="py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to profile
            </Link>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Build your resume</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No job experience yet? That's normal. Projects, clubs, sports and volunteering count.
            </p>
          </div>
          <SaveIndicator status={status} onRetry={retry} />
        </div>

        <ol className="mt-6 flex flex-wrap gap-2" aria-label="Resume steps">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  i === step ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="tabular-nums">{i + 1}</span> {label}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {step === 0 ? <ContactStep draft={draft} update={update} /> : null}
            {step === 1 ? <ExperienceStep draft={draft} update={update} /> : null}
            {step === 2 ? <SkillsStep draft={draft} update={update} /> : null}
            {step === 3 ? <SummaryStep draft={draft} update={update} /> : null}
            {step === 4 ? <DownloadStep draft={draft} doc={doc} update={update} /> : null}
            <div className="flex justify-between">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Next: {STEPS[step + 1]} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Live preview">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
            <ResumePaper doc={doc} template={draft.template} />
          </aside>
        </div>
      </Container>
    </SitePage>
  );
}

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status === "saving") return <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</p>;
  if (status === "saved") return <p className="inline-flex items-center gap-1.5 text-sm text-success"><Check className="h-4 w-4" /> Saved to your account</p>;
  if (status === "error")
    return (
      <p className="inline-flex items-center gap-2 text-sm text-destructive">
        <CloudOff className="h-4 w-4" /> Couldn't save your latest changes.
        <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>
      </p>
    );
  return <p className="text-sm text-muted-foreground">Changes save automatically</p>;
}

type StepProps = { draft: StudentResume; update: (patch: Partial<StudentResume>) => void };

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ id, label, optional, children }: { id: string; label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id}>
        {label} {optional ? <span className="font-normal text-muted-foreground">(optional)</span> : null}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ContactStep({ draft, update }: StepProps) {
  const c = draft.contact ?? {};
  const e = draft.education ?? {};
  const setC = (k: keyof typeof c, v: string) => update({ contact: { ...c, [k]: v } });
  const setE = (k: keyof typeof e, v: string) => update({ education: { ...e, [k]: v } });
  return (
    <>
      <Card title="Contact info" hint="We filled in what we know from your profile. Use a professional email.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="r-name" label="Full name"><Input id="r-name" value={c.name ?? ""} onChange={(ev) => setC("name", ev.target.value)} /></Field>
          <Field id="r-email" label="Email"><Input id="r-email" type="email" value={c.email ?? ""} onChange={(ev) => setC("email", ev.target.value)} /></Field>
          <Field id="r-phone" label="Phone" optional><Input id="r-phone" value={c.phone ?? ""} onChange={(ev) => setC("phone", ev.target.value)} /></Field>
          <Field id="r-loc" label="City, State" optional><Input id="r-loc" value={c.location ?? ""} onChange={(ev) => setC("location", ev.target.value)} placeholder="Austin, TX" /></Field>
        </div>
        <Field id="r-link" label="Portfolio or LinkedIn" optional><Input id="r-link" value={c.link ?? ""} onChange={(ev) => setC("link", ev.target.value)} /></Field>
      </Card>
      <Card title="School">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="r-school" label="School name"><Input id="r-school" value={e.school ?? ""} onChange={(ev) => setE("school", ev.target.value)} /></Field>
          <Field id="r-grad" label="Graduation year"><Input id="r-grad" value={e.graduationYear ?? ""} onChange={(ev) => setE("graduationYear", ev.target.value)} placeholder="2027" /></Field>
          <Field id="r-gpa" label="GPA" optional><Input id="r-gpa" value={e.gpa ?? ""} onChange={(ev) => setE("gpa", ev.target.value)} placeholder="Only if you want to share it" /></Field>
        </div>
        <Field id="r-course" label="Relevant classes" optional><Input id="r-course" value={e.coursework ?? ""} onChange={(ev) => setE("coursework", ev.target.value)} placeholder="AP Computer Science, Marketing" /></Field>
      </Card>
    </>
  );
}

function ExperienceStep({ draft, update }: StepProps) {
  const entries = draft.entries ?? [];
  const setEntries = (next: ResumeEntry[]) => update({ entries: next });
  const add = (category: ResumeEntryCategory) =>
    setEntries([...entries, { id: newEntryId(), category, title: "", organization: "", dates: "", bullets: [] }]);
  return (
    <>
      <Card title="Add your experiences" hint="Pick anything you've done. Unpaid things count just as much on a first resume.">
        <div className="grid gap-2 sm:grid-cols-2">
          {ENTRY_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => add(cat.value)}
              className="rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary"
            >
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink"><Plus className="h-3.5 w-3.5" /> {cat.value}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{cat.hint}</span>
            </button>
          ))}
        </div>
      </Card>
      {entries.length === 0 ? (
        <div className="rounded-xl border border-warning/30 bg-warning-soft/50 p-4 text-sm text-foreground">
          <div className="flex gap-3"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" /><p>Not sure where to start? A class project you're proud of or helping at a school event is a great first entry.</p></div>
        </div>
      ) : null}
      {entries.map((entry, index) => (
        <EntryEditor
          key={entry.id}
          entry={entry}
          onChange={(next) => setEntries(entries.map((x) => (x.id === entry.id ? next : x)))}
          onRemove={() => setEntries(entries.filter((x) => x.id !== entry.id))}
          index={index}
        />
      ))}
    </>
  );
}

function EntryEditor({ entry, onChange, onRemove, index }: { entry: ResumeEntry; onChange: (e: ResumeEntry) => void; onRemove: () => void; index: number }) {
  const rewrite = useServerFn(rewriteBullets);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<ResumeEntry>) => onChange({ ...entry, ...patch });
  const id = `entry-${index}`;

  async function makeBullets() {
    const source = notes.trim() || entry.bullets.join("\n");
    if (!source) {
      toast.info("Write a few words about what you actually did first.");
      return;
    }
    setBusy(true);
    try {
      const { bullets } = await rewrite({ data: { category: entry.category, title: entry.title, organization: entry.organization, notes: source } });
      set({ bullets });
      setNotes("");
      toast.success("Bullet points written from your own words. Check that each one is true.");
    } catch (error) {
      const fallback = source.split(/\n+/).map(tidyBullet).filter(Boolean);
      set({ bullets: fallback });
      toast.warning(`${error instanceof Error ? error.message : "AI help is unavailable."} We tidied your wording instead.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{entry.category}</span>
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove ${entry.title || entry.category}`}><Trash2 className="h-4 w-4" /></Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-t`} label="Your role or project name"><Input id={`${id}-t`} value={entry.title} onChange={(e) => set({ title: e.target.value })} placeholder={entry.category === "Work" ? "Cashier" : "Team member"} /></Field>
        <Field id={`${id}-o`} label="Organization" optional><Input id={`${id}-o`} value={entry.organization} onChange={(e) => set({ organization: e.target.value })} placeholder="Lincoln High Robotics Club" /></Field>
        <Field id={`${id}-d`} label="Dates" optional><Input id={`${id}-d`} value={entry.dates} onChange={(e) => set({ dates: e.target.value })} placeholder="Sep 2024 – Present" /></Field>
      </div>
      <div className="mt-4">
        <Field id={`${id}-n`} label="What did you do? Use your own words">
          <Textarea id={`${id}-n`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="i helped run the bake sale and made the posters, we raised money for the trip" />
        </Field>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" variant="outline" onClick={makeBullets} disabled={busy}>
            {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
            {entry.bullets.length ? "Rewrite as bullet points" : "Turn into bullet points"}
          </Button>
          <span className="text-xs text-muted-foreground">We only reword what you wrote. We never add numbers or achievements.</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Label>Bullet points</Label>
        {entry.bullets.map((b, i) => (
          <div key={i} className="flex gap-2">
            <Input aria-label={`Bullet ${i + 1}`} value={b} onChange={(e) => set({ bullets: entry.bullets.map((x, j) => (j === i ? e.target.value : x)) })} />
            <Button variant="ghost" size="icon" aria-label={`Remove bullet ${i + 1}`} onClick={() => set({ bullets: entry.bullets.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => set({ bullets: [...entry.bullets, ""] })}><Plus className="mr-1 h-3.5 w-3.5" /> Add bullet</Button>
      </div>
    </section>
  );
}

function SkillsStep({ draft, update }: StepProps) {
  const [skillsText, setSkillsText] = useState(draft.skills.join(", "));
  return (
    <>
      <Card title="Skills" hint="Separate with commas. Mix people skills and tools you can actually use.">
        <Field id="r-skills" label="Skills">
          <Input
            id="r-skills"
            value={skillsText}
            onChange={(e) => {
              setSkillsText(e.target.value);
              update({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) });
            }}
            placeholder="Teamwork, Customer service, Canva, Spanish (conversational)"
          />
        </Field>
      </Card>
      <Card title="Awards and certifications" hint="One per line: honor roll, CPR, merit badges, competition results.">
        <Textarea aria-label="Awards and certifications" rows={4} value={draft.awards} onChange={(e) => update({ awards: e.target.value })} placeholder={"Honor Roll, 2024–2025\nRed Cross CPR & First Aid"} />
      </Card>
      <Card title="Availability">
        <Field id="r-avail" label="When can you work?" optional><Input id="r-avail" value={draft.availability} onChange={(e) => update({ availability: e.target.value })} placeholder="Weekdays after 3:30 PM, weekends" /></Field>
      </Card>
    </>
  );
}

function SummaryStep({ draft, update }: StepProps) {
  return (
    <Card title="Short summary" hint="Optional. Two sentences about who you are and what you're looking for.">
      <Textarea aria-label="Summary" rows={4} value={draft.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="Reliable high school junior with experience organizing school events and tutoring younger students. Looking for a part-time role where I can help customers and learn new skills." />
      <p className="text-xs text-muted-foreground">Tip: keep it about you and your goals. Skip words like "hardworking" unless your experiences show it.</p>
    </Card>
  );
}

const TEMPLATES: { value: ResumeTemplate; label: string; hint: string }[] = [
  { value: "classic", label: "Classic", hint: "Serif type, centered header. Traditional and safe." },
  { value: "modern", label: "Modern", hint: "Clean sans-serif with a blue accent line." },
  { value: "minimal", label: "Minimal", hint: "No lines, plenty of white space." },
];

function DownloadStep({ draft, doc, update }: StepProps & { doc: ResumeDoc }) {
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);
  useEffect(() => {
    void import("jspdf");
    void import("docx");
  }, []);
  async function download(kind: "pdf" | "docx") {
    setBusy(kind);
    try {
      await downloadResume(doc, draft.template, kind);
    } catch {
      toast.error("The download didn't work. Please try again.");
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <Card title="Choose a template" hint="All three are single-column and easy for hiring software to read.">
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Template">
          {TEMPLATES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={draft.template === t.value}
              onClick={() => update({ template: t.value })}
              className={cn("rounded-lg border p-3 text-left transition-colors", draft.template === t.value ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50")}
            >
              <span className="text-sm font-medium text-ink">{t.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{t.hint}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card title="Download" hint="US Letter size, ready to print or upload to an application.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => download("pdf")} disabled={busy !== null}>
            {busy === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Download PDF
          </Button>
          <Button variant="outline" onClick={() => download("docx")} disabled={busy !== null}>
            {busy === "docx" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />} Download Word (.docx)
          </Button>
        </div>
      </Card>
      <Card title="Application privacy">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Let me attach this resume when I apply on LocalStep</p>
          <Switch checked={draft.shareWithApplications} onCheckedChange={(checked) => update({ shareWithApplications: checked })} aria-label="Let me attach this resume when I apply" />
        </div>
        <p className="text-xs text-muted-foreground">Your resume is never publicly searchable. You choose what to share each time you apply.</p>
      </Card>
    </>
  );
}

/** On-screen version of the same document the PDF/DOCX exports produce. */
function ResumePaper({ doc, template }: { doc: ResumeDoc; template: ResumeTemplate }) {
  const center = template !== "modern";
  return (
    <div
      className={cn(
        "aspect-[8.5/11] overflow-auto border border-border bg-white p-6 text-[11px] leading-snug text-slate-900 shadow-raised sm:p-8",
        template === "classic" && "font-serif",
      )}
    >
      <header className={cn(center && "text-center")}>
        <h2 className={cn("text-xl font-bold", template === "modern" && "text-blue-900")}>{doc.name}</h2>
        {doc.contactLine ? <p className="mt-0.5 text-slate-600">{doc.contactLine}</p> : null}
      </header>
      {doc.sections.length === 0 ? <p className="mt-6 text-center text-slate-500">Your resume will appear here as you fill in each step.</p> : null}
      {doc.sections.map((s) => (
        <section key={s.title} className="mt-3">
          <h3
            className={cn(
              "text-xs font-bold",
              template !== "minimal" && "border-b uppercase tracking-wider",
              template === "modern" ? "border-blue-900 text-blue-900" : "border-slate-800",
            )}
          >
            {s.title}
          </h3>
          {s.kind === "text" ? (
            <p className="mt-1">{s.text}</p>
          ) : (
            s.items.map((item, i) => (
              <div key={i} className="mt-1.5">
                {item.heading ? (
                  <div className="flex justify-between gap-3">
                    <p><span className="font-semibold">{item.heading}</span>{item.sub ? `, ${item.sub}` : ""}</p>
                    {item.dates ? <p className="shrink-0">{item.dates}</p> : null}
                  </div>
                ) : null}
                {item.bullets.length ? (
                  <ul className="ml-4 list-disc">
                    {item.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </section>
      ))}
    </div>
  );
}
