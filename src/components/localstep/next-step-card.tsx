import { ArrowRight, CalendarClock, CheckCircle2, CircleAlert, Flag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { NextStep } from "@/lib/localstep/next-steps";
import { Button } from "@/components/ui/button";

const styles = {
  urgent: "border-destructive/30 bg-destructive/5",
  high: "border-primary/30 bg-accent/30",
  medium: "border-border bg-surface",
  low: "border-border bg-surface-sunken",
} as const;

export function NextStepCard({ step, onDismiss }: { step: NextStep; onDismiss?: (id: string) => void }) {
  return <article className={`rounded-xl border p-4 ${styles[step.priority]}`}>
    <div className="flex items-start gap-3">
      {step.priority === "urgent" ? <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /> : step.kind === "task" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> : <Flag className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-ink">{step.title}</h3><span className="rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{step.priority}</span></div>
        <p className="mt-1 text-sm text-muted-foreground">{step.reason}</p>
        {step.date ? <p className="mt-2 text-xs font-medium text-muted-foreground"><CalendarClock className="mr-1 inline h-3.5 w-3.5" />{new Date(`${step.date}T12:00:00`).toLocaleDateString()}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2"><Button asChild size="sm"><Link to={step.href as never}>{step.cta}<ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>{onDismiss ? <Button variant="ghost" size="sm" onClick={() => onDismiss(step.id)}>Dismiss</Button> : null}</div>
      </div>
    </div>
  </article>;
}
