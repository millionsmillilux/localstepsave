export type EmploymentType = "Part-time" | "Internship" | "Summer" | "Volunteer" | "Seasonal";

export type Schedule = "After school" | "Weekends" | "Summer" | "Flexible" | "After school + weekends";

export type ExperienceLevel = "No experience required" | "Training provided" | "Some experience preferred";

export type JobCategory =
  | "Food & Beverage"
  | "Technology"
  | "Community"
  | "Retail"
  | "Recreation"
  | "Creative"
  | "Sports"
  | "Office";

export interface Job {
  id: string;
  title: string;
  employer: string;
  employerBlurb: string;
  location: string;
  distanceMiles: number;
  payMin: number | null;
  payMax: number | null;
  payNote?: string;
  employmentType: EmploymentType;
  schedule: Schedule;
  minimumAge: number;
  maximumAge?: number | null;
  experience: ExperienceLevel;
  category: JobCategory;
  summary: string;
  description: string;
  responsibilities: string[];
  lookingFor: string[];
  scheduleDetail: string;
  requirements: string[];
  tags?: string[];
  active?: boolean;
  deadline?: string | null;
  featured?: boolean;
  postedDaysAgo: number;
  demo: boolean;
}

export interface StudentProfile {
  name: string;
  school: string;
  age?: number | null;
  graduationYear: string;
  bio: string;
  interests: string[];
  skills: string[];
  availability: string[];
  preferredDistance: number;
  preferredLocation?: string;
  experience: string;
  activities: string;
  resumeNote: string;
  jobTypes?: string[];
  categories?: string[];
}

export interface Application {
  id: string;
  jobId: string;
  status: "Submitted" | "In review";
  createdAt: string;
}

export interface SavedJob {
  jobId: string;
  savedAt: string;
}

export interface Account {
  role: "student" | "employer";
  email: string;
  businessName?: string;
}
