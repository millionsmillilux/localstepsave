import { Link, createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Check, CircleCheck } from "lucide-react";
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

import { Container, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPay } from "@/lib/localstep/jobs";
import { profileCompletion, useLocalStep } from "@/lib/localstep/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply/$jobId")({
  staticData: { sitemap: false },
  head: () => ({ ...seoHead({ path: "/apply", title: "Apply | LocalStep", description: "Apply to a local opportunity on LocalStep.", noindex: true }) }),
  component: ApplyPage,
});

const steps = ["Review profile", "Questions", "Message", "Review", "Confirmation"];

function ApplyPage() {
  const { jobId } = Route.useParams();
  const {
    allJobs,
    account,
    profile,
    updateProfile,
    submitApplication,
    applications,
    hydrated,
    resume,
  } = useLocalStep();
  const job = allJobs.find((item) => item.id === jobId);
  const existing = applications.find((application) => application.jobId === jobId && application.status !== "Withdrawn");
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(Boolean(existing));
  const [source, setSource] = useState<"profile" | "resume">(resume.shareWithApplications ? "resume" : "profile");
  const completion = profileCompletion(profile);
  const questions = job?.applicationQuestions ?? [];
  const matchScore = useMemo(() => {
    if (!job) return 0;
    const haystack = `${job.title} ${job.category} ${job.lookingFor.join(" ")}`.toLowerCase();
    const matches = [...profile.skills, ...profile.interests].filter((item) => haystack.includes(item.toLowerCase())).length;
    return Math.min(98, Math.max(62, 68 + matches * 8 + (profile.availability.length ? 8 : 0)));
  }, [job, profile]);

  if (!job) {
    return <SitePage><Container className="py-24 text-center"><h1 className="text-2xl font-semibold text-ink">We couldn't find that opportunity</h1><Button asChild className="mt-6"><Link to="/jobs">Browse Opportunities</Link></Button></Container></SitePage>;
  }
  if (job.active === false) {
    return <SitePage><Container className="py-24 text-center"><h1 className="text-2xl font-semibold text-ink">Applications are closed</h1><p className="mt-2 text-sm text-muted-foreground">This opportunity is no longer accepting applications.</p><Button asChild className="mt-6"><Link to="/jobs/$jobId" params={{ jobId }}>View Opportunity</Link></Button></Container></SitePage>;
  }
  if (!account) {
    return <SitePage><Container className="max-w-xl py-24 text-center"><h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in to apply</h1><p className="mt-2 text-sm text-muted-foreground">Create or sign in to your student account to submit an application for {job.title}.</p><Button asChild className="mt-6"><Link to="/auth" search={{ mode: "signin" }}>Sign in to continue</Link></Button></Container></SitePage>;
  }

  if (submitted) {
    return (
      <SitePage>
        <Container className="max-w-xl py-20 text-center">
          <CircleCheck className="mx-auto h-10 w-10 text-success" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Application submitted!</h1>
          <p className="mt-3 text-sm text-muted-foreground">Your application has been sent to {job.employer}.</p>
          <div className="mt-5 rounded-xl border border-border bg-surface p-5 text-left text-sm">
            <p className="font-semibold text-ink">What happens next?</p>
            <p className="mt-2 text-muted-foreground">The employer will review your application and may contact you if they want to move forward.</p>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild><Link to="/applications">Track Application</Link></Button>
            <Button asChild variant="outline"><Link to="/jobs">Find More Opportunities</Link></Button>
          </div>
        </Container>
      </SitePage>
    );
  }
  const safeJob = job;

  function submit() {
    submitApplication(safeJob.id, { message, questionAnswers: answers, matchScore, source });
    setSubmitted(true);
  }

  const missingRequired = questions.some((question) => question.required && !answers[question.id]?.trim());
  const canContinue = (step !== 0 || (profile.name.trim().length > 0 && (!job.requiresResume || source === "resume"))) && (step !== 1 || !missingRequired);
  return (
    <SitePage>
      <Container className="max-w-3xl py-10">
        <p className="text-sm text-muted-foreground">Applying to</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{job.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{job.employer} · {job.location} · {formatPay(job)}</p>
        <ol className="mt-8 grid grid-cols-5 gap-1" aria-label="Application steps">
          {steps.map((label, index) => <li key={label} className="text-center text-xs">
            <span className={cn("mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold", index < step ? "border-success bg-success text-success-foreground" : index === step ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>
            <span className={cn("mt-1 hidden sm:block", index === step ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
          </li>)}
        </ol>

        <div className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
          {step === 0 ? <ProfileStep profile={profile} updateProfile={updateProfile} completion={completion.percent} suggestions={completion.suggestions} source={source} setSource={setSource} hasResume={resume.shareWithApplications} requiresResume={Boolean(job.requiresResume)} /> : null}
          {step === 1 ? <QuestionsStep questions={questions} answers={answers} setAnswers={setAnswers} /> : null}
          {step === 2 ? <div className="space-y-4"><h2 className="text-base font-semibold text-ink">Add a message to the employer <span className="font-normal text-muted-foreground">(optional)</span></h2><Textarea rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell the employer anything else you'd like them to know." /></div> : null}
          {step === 3 ? <ReviewStep job={job} profile={profile} answers={answers} questions={questions} message={message} matchScore={matchScore} source={source} /> : null}
          {step === 4 ? null : <div className="mt-8 flex items-center justify-between"><Button variant="ghost" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Back</Button><Button onClick={() => step === 3 ? submit() : setStep((value) => value + 1)} disabled={!canContinue}>{step === 3 ? "Submit Application" : "Continue"}</Button></div>}
        </div>
        {!hydrated ? <p className="mt-3 text-center text-xs text-muted-foreground">Loading your profile…</p> : null}
      </Container>
    </SitePage>
  );
}

function ProfileStep({ profile, updateProfile, completion, suggestions, source, setSource, hasResume, requiresResume }: { profile: ReturnType<typeof useLocalStep>["profile"]; updateProfile: ReturnType<typeof useLocalStep>["updateProfile"]; completion: number; suggestions: string[]; source: "profile" | "resume"; setSource: (source: "profile" | "resume") => void; hasResume: boolean; requiresResume: boolean }) {
  return <div className="space-y-5">
    <div><h2 className="text-base font-semibold text-ink">Choose what to share</h2><p className="mt-1 text-sm text-muted-foreground">You control whether this employer receives your LocalStep profile or your resume.</p></div>
    {requiresResume ? <div className="rounded-lg border border-warning/40 bg-warning-soft/50 p-3 text-sm"><strong>This opportunity requires a resume.</strong> Attach your LocalStep Resume before submitting.</div> : null}
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" onClick={() => setSource("profile")} className={cn("rounded-lg border p-4 text-left", source === "profile" ? "border-primary bg-accent" : "border-border")}><p className="font-semibold text-ink">Use my LocalStep Profile</p><p className="mt-1 text-xs text-muted-foreground">Share your school, skills, interests, and activities.</p></button>
      <button type="button" disabled={!hasResume} onClick={() => setSource("resume")} className={cn("rounded-lg border p-4 text-left disabled:cursor-not-allowed disabled:opacity-50", source === "resume" ? "border-primary bg-accent" : "border-border")}><p className="font-semibold text-ink">Attach my Resume</p><p className="mt-1 text-xs text-muted-foreground">{hasResume ? "Share the resume you built on LocalStep." : "Build and enable your resume in Resume Builder first."}</p></button>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {(["name", "school", "graduationYear"] as const).map((field) => <div key={field}><Label htmlFor={`apply-${field}`}>{field === "graduationYear" ? "Graduation year" : field.charAt(0).toUpperCase() + field.slice(1)}</Label><Input id={`apply-${field}`} className="mt-1.5" value={profile[field]} onChange={(event) => updateProfile({ [field]: event.target.value })} /></div>)}
    </div>
    <ProfileText label="Skills" value={profile.skills.join(", ")} onChange={(value) => updateProfile({ skills: value.split(",").map((item) => item.trim()).filter(Boolean) })} hint="Separate skills with commas" />
    <ProfileText label="Interests" value={profile.interests.join(", ")} onChange={(value) => updateProfile({ interests: value.split(",").map((item) => item.trim()).filter(Boolean) })} hint="Separate interests with commas" />
    <ProfileText label="Activities" value={profile.activities} onChange={(activities) => updateProfile({ activities })} />
    <ProfileText label="Relevant experience" value={profile.experience} onChange={(experience) => updateProfile({ experience })} />
    <ProfileText label="Availability" value={profile.availability.join(", ")} onChange={(value) => updateProfile({ availability: value.split(",").map((item) => item.trim()).filter(Boolean) })} hint="Example: Weekends, after school" />
    <div className="rounded-lg bg-accent/60 p-4"><div className="flex justify-between text-sm font-medium text-ink"><span>Application strength</span><span>{completion}%</span></div><div className="mt-2 h-2 rounded-full bg-background"><div className="h-2 rounded-full bg-primary" style={{ width: `${completion}%` }} /></div>{suggestions.length ? <p className="mt-2 text-xs text-muted-foreground">Improve your application: {suggestions.slice(0, 2).join(" · ")}</p> : null}</div>
  </div>;
}

function ProfileText({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <div><Label>{label}</Label><Textarea className="mt-1.5" rows={2} value={value} onChange={(event) => onChange(event.target.value)} placeholder={hint} /></div>;
}

function QuestionsStep({ questions, answers, setAnswers }: { questions: NonNullable<ReturnType<typeof useLocalStep>["allJobs"][number]["applicationQuestions"]>; answers: Record<string, string>; setAnswers: Dispatch<SetStateAction<Record<string, string>>> }) {
  if (!questions.length) return <div><h2 className="text-base font-semibold text-ink">No extra questions</h2><p className="mt-1 text-sm text-muted-foreground">This employer is happy to review your LocalStep profile as-is.</p></div>;
  return <div className="space-y-5"><div><h2 className="text-base font-semibold text-ink">A few questions from the employer</h2><p className="mt-1 text-sm text-muted-foreground">Answer honestly. Your profile is enough to apply.</p></div>{questions.map((question) => <div key={question.id}><Label htmlFor={question.id}>{question.prompt}{question.required ? " *" : ""}</Label>{question.type === "yesno" ? <div className="mt-2 flex gap-2">{["Yes", "No"].map((option) => <Button key={option} type="button" variant={answers[question.id] === option ? "default" : "outline"} onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}>{option}</Button>)}</div> : question.type === "choice" ? <div className="mt-2 flex flex-wrap gap-2">{(question.options ?? []).map((option) => <Button key={option} type="button" variant={answers[question.id] === option ? "default" : "outline"} onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}>{option}</Button>)}</div> : question.type === "long" ? <Textarea id={question.id} className="mt-1.5" rows={4} value={answers[question.id] ?? ""} onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))} /> : <Input id={question.id} className="mt-1.5" value={answers[question.id] ?? ""} onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))} />}</div>)}</div>;
}

function ReviewStep({ job, profile, answers, questions, message, matchScore, source }: { job: ReturnType<typeof useLocalStep>["allJobs"][number]; profile: ReturnType<typeof useLocalStep>["profile"]; answers: Record<string, string>; questions: NonNullable<ReturnType<typeof useLocalStep>["allJobs"][number]["applicationQuestions"]>; message: string; matchScore: number; source: "profile" | "resume" }) {
  return <div className="space-y-5"><div><h2 className="text-base font-semibold text-ink">Review your application</h2><p className="mt-1 text-sm text-muted-foreground">Your {matchScore}% Match Score is included for the employer.</p></div><ReviewSection title="Opportunity"><p>{job.title} · {job.employer}</p><p className="text-muted-foreground">{job.location}</p></ReviewSection><ReviewSection title="What you are sharing"><p>{source === "resume" ? "Your LocalStep Resume" : "Your LocalStep Profile"}</p><p className="text-muted-foreground">Only the option you selected will be shared with this employer.</p></ReviewSection><ReviewSection title="Your profile"><p>{profile.name || "Name not provided"} · {profile.school || "School not provided"} · Class of {profile.graduationYear || "—"}</p><p className="text-muted-foreground">Skills: {profile.skills.join(", ") || "None added"} · Availability: {profile.availability.join(", ") || "Not added"}</p></ReviewSection><ReviewSection title="Your answers">{questions.length ? questions.map((question) => <p key={question.id}><span className="font-medium">{question.prompt}</span><br />{answers[question.id] || "Not answered"}</p>) : <p className="text-muted-foreground">No custom questions</p>}</ReviewSection><ReviewSection title="Message"><p>{message || "No message added"}</p></ReviewSection></div>;
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-lg border border-border p-4 text-sm"><h3 className="mb-2 font-semibold text-ink">{title}</h3><div className="space-y-1">{children}</div></div>; }
