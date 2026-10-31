import type {
  Application,
  Job,
  StudentAchievement,
  StudentActivity,
  StudentDeadline,
  StudentProfile,
  StudentTask,
} from "./types";
import { getOpportunityMatch } from "./matching";
import { profileCompletion } from "./store";

export type NextStepPriority = "urgent" | "high" | "medium" | "low";

export interface NextStep {
  id: string;
  title: string;
  reason: string;
  priority: NextStepPriority;
  date?: string;
  href: string;
  cta: string;
  kind: "task" | "deadline" | "application" | "saved" | "profile" | "opportunity" | "portfolio";
}

const priorityWeight: Record<NextStepPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
const dayMs = 86_400_000;
const dateValue = (value?: string | null) => value ? new Date(`${value}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
const daysUntil = (value: string) => Math.ceil((dateValue(value) - Date.now()) / dayMs);

export function buildNextSteps(input: {
  profile: StudentProfile;
  applications: Application[];
  savedJobs: Job[];
  tasks: StudentTask[];
  deadlines: StudentDeadline[];
  activities: StudentActivity[];
  achievements: StudentAchievement[];
  allJobs: Job[];
}): NextStep[] {
  const steps: NextStep[] = [];
  const completion = profileCompletion(input.profile);

  for (const deadline of input.deadlines) {
    const remaining = daysUntil(deadline.dueDate);
    if (remaining <= 7) {
      steps.push({
        id: `deadline-${deadline.id}`,
        title: remaining < 0 ? `Address overdue: ${deadline.title}` : `Prepare for ${deadline.title}`,
        reason: remaining < 0 ? "This deadline has passed and needs your attention." : `Due ${remaining === 0 ? "today" : `in ${remaining} days`}.`,
        priority: remaining < 0 || remaining <= 2 ? "urgent" : "high",
        date: deadline.dueDate,
        href: "/my-steps",
        cta: "Open deadlines",
        kind: "deadline",
      });
    }
  }

  for (const task of input.tasks.filter((item) => item.status !== "completed")) {
    const remaining = task.dueDate ? daysUntil(task.dueDate) : Number.POSITIVE_INFINITY;
    if (remaining <= 7 || task.priority === "high") {
      steps.push({
        id: `task-${task.id}`,
        title: remaining < 0 ? `Finish overdue task: ${task.title}` : `Finish task: ${task.title}`,
        reason: task.dueDate ? `Due ${remaining <= 0 ? "now" : `in ${remaining} days`}.` : `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority action.`,
        priority: remaining < 0 || task.priority === "high" ? "urgent" : "high",
        ...(task.dueDate ? { date: task.dueDate } : {}),
        href: "/my-steps",
        cta: "Open tasks",
        kind: "task",
      });
    }
  }

  for (const application of input.applications.filter((item) => ["Submitted", "Viewed", "Under Review", "Interview"].includes(item.status)).slice(0, 2)) {
    steps.push({
      id: `application-${application.id}`,
      title: application.status === "Interview" ? "Prepare for your interview" : "Follow up on an application",
      reason: `Your application is currently ${application.status.toLowerCase()}.`,
      priority: application.status === "Interview" ? "high" : "medium",
      ...(application.interviewDate ? { date: application.interviewDate } : {}),
      href: `/applications/${application.id}`,
      cta: "View application",
      kind: "application",
    });
  }

  for (const job of input.savedJobs.filter((item) => item.deadline).slice(0, 3)) {
    const remaining = daysUntil(job.deadline as string);
    if (remaining <= 14) {
      steps.push({
        id: `saved-${job.id}`,
        title: `Apply to ${job.title}`,
        reason: `You saved this opportunity and its deadline is ${remaining < 0 ? "overdue" : "approaching"}.`,
        priority: remaining <= 2 ? "urgent" : "high",
        ...(job.deadline ? { date: job.deadline } : {}),
        href: `/apply/${job.id}`,
        cta: "Start application",
        kind: "saved",
      });
    }
  }

  if (completion.percent < 100) {
    steps.push({
      id: "profile-completion",
      title: `Complete your profile`,
      reason: completion.suggestions[0] ?? "A complete profile helps applications and Match Scores.",
      priority: completion.percent < 50 ? "high" : "medium",
      href: "/profile",
      cta: "Update profile",
      kind: "profile",
    });
  }

  if (!input.activities.length && !input.profile.activities.trim()) {
    steps.push({ id: "add-activity", title: "Add an activity", reason: "Activities help organizations understand what you bring beyond work experience.", priority: "low", href: "/profile", cta: "Add activity", kind: "portfolio" });
  }
  if (!input.achievements.length && !input.profile.awards.trim()) {
    steps.push({ id: "add-achievement", title: "Add an achievement", reason: "Capture a milestone, award, or credential for future applications.", priority: "low", href: "/profile", cta: "Add achievement", kind: "portfolio" });
  }

  const recommended = input.allJobs
    .filter((job) => !job.demo && job.active !== false && (!job.deadline || dateValue(job.deadline) >= Date.now()))
    .map((job) => ({ job, score: getOpportunityMatch(input.profile, job)?.score ?? 0 }))
    .sort((a, b) => b.score - a.score)[0];
  if (recommended && recommended.score >= 70 && !input.applications.some((item) => item.jobId === recommended.job.id) && !input.savedJobs.some((item) => item.id === recommended.job.id)) {
    steps.push({ id: `recommended-${recommended.job.id}`, title: `Explore ${recommended.job.title}`, reason: `Your Match Score is ${recommended.score}% based on your profile.`, priority: "medium", ...(recommended.job.deadline ? { date: recommended.job.deadline } : {}), href: `/jobs/${recommended.job.id}`, cta: "View opportunity", kind: "opportunity" });
  }

  return steps.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || dateValue(a.date) - dateValue(b.date)).slice(0, 8);
}
