import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

function reportSaveError(label: string, error: unknown) {
  console.error(`[Supabase] ${label}:`, error);
  toast.error(`${label}. Your change was not saved — please try again.`);
}
import type {
  Account,
  Application,
  ApplicationStatus,
  BusinessProfile,
  Job,
  OpportunityReport,
  OpportunityReportReason,
  OpportunityType,
  SavedJob,
  StudentProfile,
  StudentResume,
  StudentTask,
  StudentDeadline,
  StudentActivity,
  StudentAchievement,
  VerificationStatus,
} from "./types";

export interface LocalStepState {
  account: Account | null;
  profile: StudentProfile;
  resume: StudentResume;
  saved: SavedJob[];
  applications: Application[];
  tasks: StudentTask[];
  deadlines: StudentDeadline[];
  activities: StudentActivity[];
  achievements: StudentAchievement[];
  employerJobs: Job[];
  businessProfiles: BusinessProfile[];
  opportunityReports: OpportunityReport[];
  progressError: string | null;
}

const starterResume: StudentResume = {
  template: "classic",
  summary: "",
  skills: [],
  experience: "",
  projects: "",
  activities: "",
  volunteerExperience: "",
  awards: "",
  availability: "",
  shareWithApplications: true,
  updatedAt: new Date(0).toISOString(),
};

export const emptyProfile: StudentProfile = {
  name: "",
  school: "",
  age: null,
  graduationYear: "",
  bio: "",
  interests: [],
  skills: [],
  availability: [],
  preferredDistance: 10,
  preferredLocation: "",
  locationType: "general",
  transportation: "Parent/guardian",
  experience: "",
  activities: "",
  volunteerExperience: "",
  workExperience: "",
  projects: "",
  awards: "",
  resumeNote: "",
  jobTypes: [],
  categories: [],
};

const initialState: LocalStepState = {
  account: null,
  profile: emptyProfile,
  resume: starterResume,
  saved: [],
  applications: [],
  tasks: [],
  deadlines: [],
  activities: [],
  achievements: [],
  employerJobs: [],
  businessProfiles: [],
  opportunityReports: [],
  progressError: null,
};

function toJob(item: {
  id: string;
  opportunity_type?: string | null;
  title: string;
  employer_name: string;
  location: string;
  summary: string;
  description: string;
  status: string;
  created_at: string;
  category: string | null;
  employment_type: string | null;
  schedule: string | null;
  pay_min: number | null;
  pay_max: number | null;
  minimum_age: number | null;
  maximum_age: number | null;
  experience: string | null;
  requires_resume: boolean;
  application_questions: unknown;
  deadline: string | null;
  required_skills: string[];
  tags: string[];
  openings: number;
  contact_name: string | null;
  contact_email: string | null;
  contact_social_links: unknown;
  owner_id: string;
  views_count: number;
  saves_count: number;
}): Job {
  return {
    id: item.id,
    opportunityType: (item.opportunity_type ?? "job") as OpportunityType,
    title: item.title,
    employer: item.employer_name,
    employerBlurb: item.summary,
    location: item.location,
    distanceMiles: 0,
    payMin: item.pay_min,
    payMax: item.pay_max,
    employmentType: (item.employment_type ?? "Part-time") as Job["employmentType"],
    schedule: (item.schedule ?? "Flexible") as Job["schedule"],
    minimumAge: item.minimum_age ?? 16,
    maximumAge: item.maximum_age,
    experience: (item.experience ?? "No experience required") as Job["experience"],
    category: (item.category ?? "Community") as Job["category"],
    summary: item.summary,
    description: item.description,
    responsibilities: [],
    lookingFor: [],
    scheduleDetail: item.schedule ?? "",
    requirements: [],
    tags: item.tags,
    requiredSkills: item.required_skills,
    active: item.status === "active",
    moderationStatus: item.status as Job["moderationStatus"],
    deadline: item.deadline,
    postedDaysAgo: Math.max(
      0,
      Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000),
    ),
    demo: false,
    applicationQuestions: Array.isArray(item.application_questions)
      ? (item.application_questions as Job["applicationQuestions"])
      : [],
    requiresResume: item.requires_resume,
    openings: item.openings,
    contactName: item.contact_name ?? undefined,
    contactEmail: item.contact_email ?? undefined,
    socialLinks:
      typeof item.contact_social_links === "object" && item.contact_social_links !== null
        ? (item.contact_social_links as Record<string, string>)
        : {},
    ownerId: item.owner_id,
    viewsCount: item.views_count,
    savesCount: item.saves_count,
  };
}

function toBusinessProfile(item: {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  industry: string | null;
  website: string | null;
  contact_email: string | null;
  phone: string | null;
  logo_url: string | null;
  social_links: unknown;
  verification_status: string;
  verification_submitted_at: string | null;
  verification_reviewed_at: string | null;
  verification_notes: string | null;
}): BusinessProfile {
  return {
    id: item.id,
    ownerId: item.owner_id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    location: item.location,
    industry: item.industry ?? undefined,
    website: item.website ?? undefined,
    contactEmail: item.contact_email ?? undefined,
    phone: item.phone ?? undefined,
    logoUrl: item.logo_url ?? undefined,
    socialLinks:
      typeof item.social_links === "object" && item.social_links !== null
        ? (item.social_links as Record<string, string>)
        : {},
    verificationStatus: item.verification_status as VerificationStatus,
    verificationSubmittedAt: item.verification_submitted_at ?? undefined,
    verificationReviewedAt: item.verification_reviewed_at ?? undefined,
    verificationNotes: item.verification_notes ?? undefined,
  };
}

interface LocalStepContextValue extends LocalStepState {
  hydrated: boolean;
  allJobs: Job[];
  isSaved: (jobId: string) => boolean;
  toggleSaved: (jobId: string) => void;
  removeSaved: (jobId: string) => void;
  hasApplied: (jobId: string) => boolean;
  addApplication: (jobId: string) => void;
  submitApplication: (
    jobId: string,
    input: {
      message: string;
      questionAnswers: Record<string, string>;
      matchScore: number;
      source?: "profile" | "resume";
    },
  ) => void;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  addApplicationNote: (applicationId: string, note: string) => void;
  withdrawApplication: (applicationId: string) => void;
  saveTask: (input: Omit<StudentTask, "id">, id?: string) => Promise<void>;
  toggleTask: (task: StudentTask) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  saveDeadline: (input: Omit<StudentDeadline, "id">, id?: string) => Promise<void>;
  deleteDeadline: (id: string) => Promise<void>;
  saveActivity: (input: Omit<StudentActivity, "id">, id?: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  saveAchievement: (input: Omit<StudentAchievement, "id">, id?: string) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  updateProfile: (patch: Partial<StudentProfile>) => void;
  saveProfile: (profile: StudentProfile) => Promise<void>;
  updateResume: (patch: Partial<StudentResume>) => void;
  saveResume: (resume: StudentResume) => Promise<StudentResume>;
  addEmployerJob: (job: Job, status?: "draft" | "pending_review") => void;
  getBusinessProfile: (nameOrSlug: string) => BusinessProfile | undefined;
  updateBusinessProfile: (
    patch: Partial<Omit<BusinessProfile, "id" | "ownerId" | "verificationStatus">>,
  ) => Promise<void>;
  submitVerification: () => void;
  reviewVerification: (
    profileId: string,
    status: Extract<VerificationStatus, "approved" | "rejected">,
    notes?: string,
  ) => void;
  reportOpportunity: (jobId: string, reason: OpportunityReportReason, details?: string) => void;
  signIn: (account: Account) => void;
  signOut: () => void;
}

const LocalStepContext = createContext<LocalStepContextValue | null>(null);

export function LocalStepProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalStepState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  const loadRemoteState = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      const { data: publicJobs, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "active")
        .or("deadline.is.null,deadline.gte." + new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      setState({ ...initialState, employerJobs: (publicJobs ?? []).map((item) => toJob(item)) });
      setHydrated(true);
      return;
    }

    const role =
      user.app_metadata?.["role"] === "employer" || user.user_metadata?.["role"] === "employer"
        ? "employer"
        : "student";
    const [
      profileResult,
      resumeResult,
      savedResult,
      applicationsResult,
      tasksResult,
      deadlinesResult,
      activitiesResult,
      achievementsResult,
      businessResult,
      jobsResult,
    ] = await Promise.all([
      supabase.from("student_profiles").select("profile").eq("user_id", user.id).maybeSingle(),
      supabase.from("student_resumes").select("resume").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("saved_opportunities")
        .select("opportunity_id,created_at")
        .eq("user_id", user.id),
      supabase.from("applications").select("*").order("submitted_at", { ascending: false }),
      supabase.from("tasks").select("id,title,description,status,priority,due_date").order("due_date", { ascending: true }),
      supabase.from("deadlines").select("id,title,description,category,due_date,opportunity_id,application_id").order("due_date", { ascending: true }),
      supabase.from("activities").select("id,title,organization,role,description,category,start_date,end_date").order("start_date", { ascending: false }),
      supabase.from("achievements").select("id,title,organization,description,achieved_at,credential_url").order("achieved_at", { ascending: false }),
      supabase.from("business_profiles").select("*").eq("owner_id", user.id).maybeSingle(),
      role === "employer"
        ? supabase
            .from("opportunities")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false })
        : supabase
            .from("opportunities")
            .select("*")
            .eq("status", "active")
            .or("deadline.is.null,deadline.gte." + new Date().toISOString())
            .order("created_at", { ascending: false }),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (resumeResult.error) throw resumeResult.error;
    if (savedResult.error) throw savedResult.error;
    if (applicationsResult.error) throw applicationsResult.error;
    if (tasksResult.error) throw tasksResult.error;
    if (deadlinesResult.error) throw deadlinesResult.error;
    if (activitiesResult.error) throw activitiesResult.error;
    if (achievementsResult.error) throw achievementsResult.error;
    if (businessResult.error) throw businessResult.error;
    if (jobsResult.error) throw jobsResult.error;

    const account: Account = {
      role,
      email: user.email ?? "",
      userId: user.id,
      ...(role === "employer" && businessResult.data
        ? { businessName: businessResult.data.name }
        : {}),
      isAdmin: user.app_metadata?.["role"] === "admin",
    };
    const businessProfiles = businessResult.data ? [toBusinessProfile(businessResult.data)] : [];
    const jobs = (jobsResult.data ?? []).map((item) => toJob(item));
    setState({
      account,
      profile: {
        ...emptyProfile,
        ...((profileResult.data?.profile as unknown as Partial<StudentProfile> | null) ?? {}),
      },
      resume: {
        ...starterResume,
        ...((resumeResult.data?.resume as Partial<StudentResume> | null) ?? {}),
      },
      saved: (savedResult.data ?? []).map((item) => ({
        jobId: item.opportunity_id,
        savedAt: item.created_at,
      })),
      applications: (applicationsResult.data ?? []).map((item) => ({
        id: item.id,
        studentId: item.student_id,
        jobId: item.opportunity_id,
        employerId: item.employer_id ?? "",
        status: item.status as ApplicationStatus,
        submittedAt: item.submitted_at,
        createdAt: item.submitted_at,
        message: item.message,
        questionAnswers: item.question_answers as Record<string, string>,
        profileSnapshot: item.profile_snapshot as unknown as StudentProfile,
        matchScoreAtSubmission: item.match_score_at_submission,
        updatedAt: item.updated_at,
        notes: [],
        events: [],
      })),
      tasks: (tasksResult.data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority as StudentTask["priority"],
        dueDate: item.due_date,
      })),
      deadlines: (deadlinesResult.data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        dueDate: item.due_date,
        opportunityId: item.opportunity_id,
        applicationId: item.application_id,
      })),
      activities: (activitiesResult.data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        organization: item.organization,
        role: item.role,
        description: item.description,
        category: item.category as StudentActivity["category"],
        startDate: item.start_date,
        endDate: item.end_date,
      })),
      achievements: (achievementsResult.data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        organization: item.organization,
        description: item.description,
        achievedAt: item.achieved_at,
        credentialUrl: item.credential_url,
      })),
      employerJobs: jobs,
      businessProfiles,
      opportunityReports: [],
      progressError: null,
    });
    setHydrated(true);
  }, []);

  useEffect(() => {
    void loadRemoteState().catch((error: unknown) => {
      reportSaveError("Failed to hydrate LocalStep state", error);
      setState((previous) => ({ ...previous, progressError: "We couldn't load your student progress. Try refreshing." }));
      setHydrated(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      // Defer so Supabase finishes its own session bookkeeping first.
      setTimeout(() => {
        void loadRemoteState().catch((error: unknown) => {
          reportSaveError("Failed to reload state", error);
          setState((previous) => ({ ...previous, progressError: "We couldn't load your account data. Try refreshing." }));
        });
      }, 0);
    });
    return () => listener.subscription.unsubscribe();
  }, [loadRemoteState]);

  const toggleSaved = useCallback((jobId: string) => {
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setState((prev) => {
        const exists = prev.saved.some((entry) => entry.jobId === jobId);
        const request = exists
          ? supabase
              .from("saved_opportunities")
              .delete()
              .eq("user_id", data.user.id)
              .eq("opportunity_id", jobId)
          : supabase
              .from("saved_opportunities")
              .insert({ user_id: data.user.id, opportunity_id: jobId });
        void request.then(({ error }) => {
          if (error) reportSaveError("Saved opportunity update failed", error);
        });
        return {
          ...prev,
          saved: exists
            ? prev.saved.filter((entry) => entry.jobId !== jobId)
            : [{ jobId, savedAt: new Date().toISOString() }, ...prev.saved],
        };
      });
    });
  }, []);

  const removeSaved = useCallback((jobId: string) => {
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setState((prev) => ({ ...prev, saved: prev.saved.filter((entry) => entry.jobId !== jobId) }));
      void supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", data.user.id)
        .eq("opportunity_id", jobId)
        .then(({ error }) => {
          if (error) reportSaveError("Saved opportunity removal failed", error);
        });
    });
  }, []);

  const submitApplication = useCallback(
    async (
      jobId: string,
      input: {
        message: string;
        questionAnswers: Record<string, string>;
        matchScore: number;
        source?: "profile" | "resume";
      },
    ) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { error } = await supabase.from("applications").insert({
        student_id: auth.user.id,
        opportunity_id: jobId,
        profile_snapshot: state.profile as unknown as import("@/integrations/supabase/types").Json,
        message: input.message,
        question_answers:
          input.questionAnswers as unknown as import("@/integrations/supabase/types").Json,
        match_score_at_submission: input.matchScore,
      });
      if (error) {
        reportSaveError("Application submission failed", error);
        return;
      }
      await loadRemoteState();
    },
    [loadRemoteState, state.profile],
  );

  const addApplication = useCallback(
    (jobId: string) => {
      void submitApplication(jobId, { message: "", questionAnswers: {}, matchScore: 0 });
    },
    [submitApplication],
  );

  const updateApplicationStatus = useCallback(
    (applicationId: string, status: ApplicationStatus) => {
      void supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId)
        .then(({ error }) => {
          if (error) reportSaveError("Application status update failed", error);
          else void loadRemoteState();
        });
    },
    [loadRemoteState],
  );

  const addApplicationNote = useCallback((applicationId: string, note: string) => {
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user || !note.trim()) return;
      void supabase
        .from("application_notes")
        .insert({ application_id: applicationId, employer_id: data.user.id, body: note.trim() });
    });
  }, []);

  const withdrawApplication = useCallback(
    (applicationId: string) => {
      updateApplicationStatus(applicationId, "Withdrawn");
    },
    [updateApplicationStatus],
  );

  const mutateProgress = useCallback(async (
    table: "tasks" | "deadlines" | "activities" | "achievements",
    input: Record<string, unknown>,
    id?: string,
  ) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sign in to manage your student progress.");
    const payload = { ...input, student_id: auth.user.id, updated_at: new Date().toISOString() };
    const result = id
      ? await supabase.from(table).update(payload as never).eq("id", id).eq("student_id", auth.user.id)
      : await supabase.from(table).insert(payload as never);
    if (result.error) throw result.error;
    await loadRemoteState();
  }, [loadRemoteState]);

  const deleteProgress = useCallback(async (
    table: "tasks" | "deadlines" | "activities" | "achievements",
    id: string,
  ) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sign in to manage your student progress.");
    const { error } = await supabase.from(table).delete().eq("id", id).eq("student_id", auth.user.id);
    if (error) throw error;
    await loadRemoteState();
  }, [loadRemoteState]);

  const saveTask = useCallback((input: Omit<StudentTask, "id">, id?: string) => mutateProgress("tasks", {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    due_date: input.dueDate || null,
  }, id), [mutateProgress]);
  const toggleTask = useCallback((task: StudentTask) => saveTask({ ...task, status: task.status === "completed" ? "todo" : "completed" }), [saveTask]);
  const deleteTask = useCallback((id: string) => deleteProgress("tasks", id), [deleteProgress]);
  const saveDeadline = useCallback((input: Omit<StudentDeadline, "id">, id?: string) => mutateProgress("deadlines", {
    title: input.title,
    description: input.description,
    category: input.category,
    due_date: input.dueDate,
    opportunity_id: input.opportunityId || null,
    application_id: input.applicationId || null,
  }, id), [mutateProgress]);
  const deleteDeadline = useCallback((id: string) => deleteProgress("deadlines", id), [deleteProgress]);
  const saveActivity = useCallback((input: Omit<StudentActivity, "id">, id?: string) => mutateProgress("activities", {
    title: input.title,
    organization: input.organization,
    role: input.role,
    description: input.description,
    category: input.category,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
  }, id), [mutateProgress]);
  const deleteActivity = useCallback((id: string) => deleteProgress("activities", id), [deleteProgress]);
  const saveAchievement = useCallback((input: Omit<StudentAchievement, "id">, id?: string) => mutateProgress("achievements", {
    title: input.title,
    organization: input.organization,
    description: input.description,
    achieved_at: input.achievedAt || null,
    credential_url: input.credentialUrl || null,
  }, id), [mutateProgress]);
  const deleteAchievement = useCallback((id: string) => deleteProgress("achievements", id), [deleteProgress]);

  const updateProfile = useCallback((patch: Partial<StudentProfile>) => {
    setState((prev) => {
      const profile = { ...prev.profile, ...patch };
      void supabase.auth.getUser().then(({ data }) => {
        if (data.user)
          void supabase
            .from("student_profiles")
            .upsert({
              user_id: data.user.id,
              profile: profile as unknown as import("@/integrations/supabase/types").Json,
            })
            .then(({ error }) => {
              if (error) reportSaveError("Student profile update failed", error);
            });
      });
      return { ...prev, profile };
    });
  }, []);

  const saveProfile = useCallback(async (profile: StudentProfile) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Your session has expired. Please sign in again.");
    const { error } = await supabase.from("student_profiles").upsert({
      user_id: auth.user.id,
      profile: profile as unknown as import("@/integrations/supabase/types").Json,
    });
    if (error) throw error;
    await loadRemoteState();
  }, [loadRemoteState]);

  const updateResume = useCallback((patch: Partial<StudentResume>) => {
    setState((prev) => {
      const resume = { ...prev.resume, ...patch, updatedAt: new Date().toISOString() };
      void supabase.auth.getUser().then(({ data }) => {
        if (data.user)
          void supabase
            .from("student_resumes")
            .upsert({ user_id: data.user.id, resume: resume as unknown as import("@/integrations/supabase/types").Json })
            .then(({ error }) => {
              if (error) reportSaveError("Student resume update failed", error);
            });
      });
      return { ...prev, resume };
    });
  }, []);

  /** Saves a full resume and resolves only after the database confirms it. */
  const saveResume = useCallback(async (next: StudentResume) => {
    const resume = { ...next, updatedAt: new Date().toISOString() };
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error("Please sign in again to save your resume.");
    const { error } = await supabase
      .from("student_resumes")
      .upsert({ user_id: data.user.id, resume: resume as unknown as import("@/integrations/supabase/types").Json });
    if (error) throw error;
    setState((prev) => ({ ...prev, resume }));
    return resume;
  }, []);

  const addEmployerJob = useCallback(
    (job: Job, status: "draft" | "pending_review" = "pending_review") => {
      void supabase.auth.getUser().then(({ data }) => {
        if (!data.user) return;
        void supabase
          .from("opportunities")
          .insert({
            id: job.id,
            owner_id: data.user.id,
            title: job.title,
            employer_name: job.employer,
            location: job.location,
            summary: job.summary,
            description: job.description,
            category: job.category,
            employment_type: job.employmentType,
            schedule: job.schedule,
            pay_min: job.payMin,
            pay_max: job.payMax,
            minimum_age: job.minimumAge,
            maximum_age: job.maximumAge ?? null,
            experience: job.experience,
            requires_resume: job.requiresResume ?? false,
            deadline: job.deadline ?? null,
            required_skills: job.requiredSkills ?? [],
            tags: job.tags ?? [],
            openings: job.openings ?? 1,
            contact_name: job.contactName ?? null,
            contact_email: job.contactEmail ?? null,
            contact_social_links: job.socialLinks ?? {},
            application_questions: (job.applicationQuestions ??
              []) as unknown as import("@/integrations/supabase/types").Json,
            opportunity_type: job.opportunityType ?? "job",
            status,
          })
          .then(({ error }) => {
            if (error) reportSaveError("Opportunity submission failed", error);
            else void loadRemoteState();
          });
      });
    },
    [loadRemoteState],
  );

  const getBusinessProfile = useCallback(
    (nameOrSlug: string) => {
      const needle = decodeURIComponent(nameOrSlug).toLowerCase();
      return state.businessProfiles.find(
        (profile) => profile.slug === needle || profile.name.toLowerCase() === needle,
      );
    },
    [state.businessProfiles],
  );

  const updateBusinessProfile = useCallback(
    async (patch: Partial<Omit<BusinessProfile, "id" | "ownerId" | "verificationStatus">>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Your session has expired. Please sign in again.");
      const existing = state.businessProfiles[0];
      const name = patch.name ?? existing?.name ?? "My business";
      const payload = {
        owner_id: auth.user.id,
        name,
        slug:
          patch.slug ??
          existing?.slug ??
          name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        description: patch.description ?? existing?.description ?? "",
        location: patch.location ?? existing?.location ?? "",
        industry: patch.industry ?? existing?.industry ?? null,
        website: patch.website ?? existing?.website ?? null,
        contact_email: patch.contactEmail ?? existing?.contactEmail ?? auth.user.email ?? null,
        phone: patch.phone ?? existing?.phone ?? null,
        logo_url: patch.logoUrl ?? existing?.logoUrl ?? null,
        social_links: patch.socialLinks ?? existing?.socialLinks ?? {},
      };
      const { error } = await supabase
        .from("business_profiles")
        .upsert(payload, { onConflict: "owner_id" });
      if (error) throw error;
      await loadRemoteState();
    },
    [loadRemoteState, state.businessProfiles],
  );

  const submitVerification = useCallback(() => {
    const profile = state.businessProfiles[0];
    if (profile)
      void supabase.rpc("submit_verification", { profile_id: profile.id }).then(({ error }) => {
        if (error) reportSaveError("Verification submission failed", error);
        else void loadRemoteState();
      });
  }, [loadRemoteState, state.businessProfiles]);

  const reviewVerification = useCallback(
    (
      profileId: string,
      status: Extract<VerificationStatus, "approved" | "rejected">,
      notes?: string,
    ) => {
      void supabase
        .from("business_profiles")
        .update({
          verification_status: status,
          verification_reviewed_at: new Date().toISOString(),
          verification_notes: notes ?? null,
        })
        .eq("id", profileId)
        .then(({ error }) => {
          if (error) reportSaveError("Verification review failed", error);
        });
    },
    [],
  );

  const reportOpportunity = useCallback(
    (jobId: string, reason: OpportunityReportReason, details = "") => {
      void supabase.auth.getUser().then(({ data }) => {
        if (data.user)
          void supabase
            .from("opportunity_reports")
            .insert({ job_id: jobId, reporter_id: data.user.id, reason, details })
            .then(({ error }) => {
              if (error) reportSaveError("Opportunity report failed", error);
            });
      });
    },
    [],
  );

  const signIn = useCallback((account: Account) => setState((prev) => ({ ...prev, account })), []);
  const signOut = useCallback(() => {
    void supabase.auth.signOut();
    setState(initialState);
  }, []);

  const value = useMemo<LocalStepContextValue>(() => {
    const allJobs = state.account
      ? state.employerJobs.filter(
          (job) => job.moderationStatus === "active" || state.account?.role === "employer",
        )
      : state.employerJobs.filter((job) => job.moderationStatus === "active");
    const visibleApplications =
      state.account?.role === "employer"
        ? state.applications.filter((application) =>
            state.employerJobs.some((job) => job.id === application.jobId),
          )
        : state.account?.role === "student"
          ? state.applications.filter(
              (application) => application.studentId === state.account?.userId,
            )
          : [];
    return {
      ...state,
      applications: visibleApplications,
      hydrated,
      allJobs,
      isSaved: (jobId) => state.saved.some((entry) => entry.jobId === jobId),
      hasApplied: (jobId) =>
        visibleApplications.some(
          (application) => application.jobId === jobId && application.status !== "Withdrawn",
        ),
      toggleSaved,
      removeSaved,
      addApplication,
      submitApplication,
      updateApplicationStatus,
      addApplicationNote,
      withdrawApplication,
      saveTask,
      toggleTask,
      deleteTask,
      saveDeadline,
      deleteDeadline,
      saveActivity,
      deleteActivity,
      saveAchievement,
      deleteAchievement,
      updateProfile,
      saveProfile,
      updateResume,
      saveResume,
      addEmployerJob,
      getBusinessProfile,
      updateBusinessProfile,
      submitVerification,
      reviewVerification,
      reportOpportunity,
      signIn,
      signOut,
    };
  }, [
    state,
    hydrated,
    toggleSaved,
    removeSaved,
    addApplication,
    submitApplication,
    updateApplicationStatus,
    addApplicationNote,
    withdrawApplication,
    updateProfile,
    updateResume,
    saveResume,
    addEmployerJob,
    getBusinessProfile,
    updateBusinessProfile,
    submitVerification,
    reviewVerification,
    reportOpportunity,
    signIn,
    signOut,
  ]);

  return <LocalStepContext.Provider value={value}>{children}</LocalStepContext.Provider>;
}

export function useLocalStep(): LocalStepContextValue {
  const context = useContext(LocalStepContext);
  if (!context) throw new Error("useLocalStep must be used inside LocalStepProvider");
  return context;
}

export function profileCompletion(profile: StudentProfile) {
  const checks = [
    profile.name.trim(),
    profile.school.trim(),
    profile.age,
    profile.graduationYear.trim(),
    profile.interests.length,
    profile.skills.length,
    profile.availability.length,
    profile.preferredLocation?.trim(),
    profile.bio.trim(),
    profile.activities.trim(),
    profile.experience.trim(),
    profile.preferredDistance,
  ];
  const done = checks.filter(Boolean).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    suggestions: [
      "name",
      "school",
      "age",
      "graduation year",
      "interests",
      "skills",
      "availability",
      "preferred location",
      "about you",
      "activities",
      "experience",
      "preferred distance",
    ]
      .filter((_, index) => !checks[index])
      .map((item) => `Add your ${item}`),
  };
}
