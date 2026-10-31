import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { demoJobs } from "./jobs";
import type { Account, Application, Job, SavedJob, StudentProfile } from "./types";

/**
 * Client-side persistence layer for the MVP prototype.
 *
 * Everything is stored in localStorage behind this single module so the same
 * API can later be backed by a database without touching the UI.
 */

const STORAGE_KEY = "localstep.state.v1";

export interface LocalStepState {
  account: Account | null;
  profile: StudentProfile;
  saved: SavedJob[];
  applications: Application[];
  employerJobs: Job[];
}

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
  experience: "",
  activities: "",
  resumeNote: "",
  jobTypes: [],
  categories: [],
};

const starterProfile: StudentProfile = {
  name: "Maya Reyes",
  school: "Barrington High School",
  age: 17,
  graduationYear: "2028",
  bio: "Sophomore looking for a first job close to school. Interested in marketing and design.",
  interests: ["Marketing", "Design", "Community", "Technology"],
  skills: ["Customer service", "Canva", "Teamwork"],
  availability: ["After school", "Weekends"],
  preferredDistance: 5,
  preferredLocation: "Barrington, IL",
  experience: "School newspaper, volunteer event helper",
  activities: "Yearbook committee, JV soccer",
  resumeNote: "",
  jobTypes: ["Part-time", "Internship"],
  categories: ["Technology", "Food & Beverage", "Community"],
};

const initialState: LocalStepState = {
  account: null,
  profile: starterProfile,
  saved: [],
  applications: [],
  employerJobs: [],
};

function readStorage(): LocalStepState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<LocalStepState>;
    return {
      ...initialState,
      ...parsed,
      profile: { ...starterProfile, ...(parsed.profile ?? {}) },
    };
  } catch {
    return initialState;
  }
}

interface LocalStepContextValue extends LocalStepState {
  hydrated: boolean;
  allJobs: Job[];
  isSaved: (jobId: string) => boolean;
  toggleSaved: (jobId: string) => void;
  removeSaved: (jobId: string) => void;
  hasApplied: (jobId: string) => boolean;
  addApplication: (jobId: string) => void;
  updateProfile: (patch: Partial<StudentProfile>) => void;
  addEmployerJob: (job: Job) => void;
  signIn: (account: Account) => void;
  signOut: () => void;
}

const LocalStepContext = createContext<LocalStepContextValue | null>(null);

export function LocalStepProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalStepState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — the prototype still works in memory */
    }
  }, [state, hydrated]);

  const toggleSaved = useCallback((jobId: string) => {
    setState((prev) => {
      const exists = prev.saved.some((entry) => entry.jobId === jobId);
      return {
        ...prev,
        saved: exists
          ? prev.saved.filter((entry) => entry.jobId !== jobId)
          : [{ jobId, savedAt: new Date().toISOString() }, ...prev.saved],
      };
    });
  }, []);

  const removeSaved = useCallback((jobId: string) => {
    setState((prev) => ({ ...prev, saved: prev.saved.filter((entry) => entry.jobId !== jobId) }));
  }, []);

  const addApplication = useCallback((jobId: string) => {
    setState((prev) => {
      if (prev.applications.some((application) => application.jobId === jobId)) return prev;
      return {
        ...prev,
        applications: [
          { id: `app-${Date.now()}`, jobId, status: "Submitted", createdAt: new Date().toISOString() },
          ...prev.applications,
        ],
      };
    });
  }, []);

  const updateProfile = useCallback((patch: Partial<StudentProfile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }, []);

  const addEmployerJob = useCallback((job: Job) => {
    setState((prev) => ({ ...prev, employerJobs: [job, ...prev.employerJobs] }));
  }, []);

  const signIn = useCallback((account: Account) => {
    setState((prev) => ({ ...prev, account }));
  }, []);

  const signOut = useCallback(() => {
    setState((prev) => ({ ...prev, account: null }));
  }, []);

  const value = useMemo<LocalStepContextValue>(() => {
    const allJobs = [...state.employerJobs, ...demoJobs];
    return {
      ...state,
      hydrated,
      allJobs,
      isSaved: (jobId) => state.saved.some((entry) => entry.jobId === jobId),
      hasApplied: (jobId) => state.applications.some((application) => application.jobId === jobId),
      toggleSaved,
      removeSaved,
      addApplication,
      updateProfile,
      addEmployerJob,
      signIn,
      signOut,
    };
  }, [state, hydrated, toggleSaved, removeSaved, addApplication, updateProfile, addEmployerJob, signIn, signOut]);

  return <LocalStepContext.Provider value={value}>{children}</LocalStepContext.Provider>;
}

export function useLocalStep(): LocalStepContextValue {
  const context = useContext(LocalStepContext);
  if (!context) throw new Error("useLocalStep must be used inside LocalStepProvider");
  return context;
}

export function profileCompletion(profile: StudentProfile) {
  const checks: { label: string; done: boolean; hint: string }[] = [
    { label: "Name", done: profile.name.trim().length > 0, hint: "Add your name" },
    { label: "School", done: profile.school.trim().length > 0, hint: "Add your school" },
    { label: "Age", done: typeof profile.age === "number" && Number.isFinite(profile.age), hint: "Add your age" },
    { label: "Graduation year", done: profile.graduationYear.trim().length > 0, hint: "Add your graduation year" },
    { label: "Interests", done: profile.interests.length > 0, hint: "Add your interests" },
    { label: "Skills", done: profile.skills.length > 0, hint: "Add your skills" },
    { label: "Availability", done: profile.availability.length > 0, hint: "Add your availability" },
    { label: "Preferred location", done: profile.preferredLocation?.trim().length > 0, hint: "Add your preferred location" },
    { label: "About you", done: profile.bio.trim().length > 0, hint: "Add a short intro" },
    { label: "Activities", done: profile.activities.trim().length > 0, hint: "Add extracurricular activities" },
    { label: "Experience", done: profile.experience.trim().length > 0, hint: "Add any experience" },
    { label: "Preferred distance", done: profile.preferredDistance > 0, hint: "Set a preferred distance" },
  ];
  const done = checks.filter((check) => check.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    suggestions: checks.filter((check) => !check.done).map((check) => check.hint),
  };
}
