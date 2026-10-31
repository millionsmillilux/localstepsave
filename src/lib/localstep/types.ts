export type EmploymentType = "Part-time" | "Internship" | "Summer" | "Volunteer" | "Seasonal";

export type Schedule =
  "After school" | "Weekends" | "Summer" | "Flexible" | "After school + weekends";

export type ExperienceLevel =
  "No experience required" | "Training provided" | "Some experience preferred";

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
  opportunityType?: OpportunityType;
  title: string;
  employer: string;
  employerBlurb: string;
  location: string;
  distanceMiles: number;
  latitude?: number | undefined;
  longitude?: number | undefined;
  payMin: number | null;
  payMax: number | null;
  payNote?: string | undefined;
  employmentType: EmploymentType;
  schedule: Schedule;
  minimumAge: number;
  maximumAge?: number | null | undefined;
  experience: ExperienceLevel;
  category: JobCategory;
  summary: string;
  description: string;
  responsibilities: string[];
  lookingFor: string[];
  scheduleDetail: string;
  requirements: string[];
  tags?: string[] | undefined;
  active?: boolean | undefined;
  moderationStatus?:
    "draft" | "pending_review" | "active" | "rejected" | "suspended" | "expired" | undefined;
  deadline?: string | null | undefined;
  featured?: boolean | undefined;
  postedDaysAgo: number;
  demo: boolean;
  applicationQuestions?: ApplicationQuestion[] | undefined;
  requiresResume?: boolean | undefined;
  requiredSkills?: string[] | undefined;
  openings?: number | undefined;
  contactName?: string | undefined;
  contactEmail?: string | undefined;
  socialLinks?: Record<string, string> | undefined;
  viewsCount?: number | undefined;
  savesCount?: number | undefined;
  ownerId?: string | undefined;
}

export type OpportunityType =
  | "job"
  | "internship"
  | "volunteer"
  | "scholarship"
  | "college_program"
  | "competition";

export type ApplicationQuestionType = "short" | "long" | "choice" | "yesno";

export interface ApplicationQuestion {
  id: string;
  prompt: string;
  type: ApplicationQuestionType;
  options?: string[] | undefined;
  required?: boolean | undefined;
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
  locationType?: "general" | "zip" | "city";
  transportation?: "Walk" | "Bike" | "Public transportation" | "Parent/guardian" | "Drive";
  experience: string;
  activities: string;
  volunteerExperience: string;
  workExperience: string;
  projects: string;
  awards: string;
  resumeNote: string;
  jobTypes?: string[];
  categories?: string[];
}

export type ResumeTemplate = "classic" | "modern" | "minimal";

export type ResumeEntryCategory =
  | "Work"
  | "School project"
  | "Club"
  | "Scouts"
  | "Volunteering"
  | "Sports"
  | "Leadership"
  | "Personal project";

export interface ResumeEntry {
  id: string;
  category: ResumeEntryCategory;
  title: string;
  organization: string;
  dates: string;
  bullets: string[];
}

export interface ResumeContact {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  link?: string;
}

export interface ResumeEducation {
  school?: string;
  graduationYear?: string;
  gpa?: string;
  coursework?: string;
}

export interface StudentResume {
  template: ResumeTemplate;
  summary: string;
  skills: string[];
  experience: string;
  projects: string;
  activities: string;
  volunteerExperience: string;
  awards: string;
  availability: string;
  shareWithApplications: boolean;
  updatedAt: string;
  /** Wizard fields (stored in the same resume record). */
  contact?: ResumeContact;
  education?: ResumeEducation;
  entries?: ResumeEntry[];
}

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  employerId: string;
  status: ApplicationStatus;
  submittedAt: string;
  createdAt: string;
  message: string;
  questionAnswers: Record<string, string>;
  profileSnapshot: StudentProfile;
  resumeSnapshot?: StudentResume;
  submissionSource?: "profile" | "resume";
  matchScoreAtSubmission: number;
  viewedAt?: string;
  interviewDate?: string;
  updatedAt: string;
  notes: string[];
  events: ApplicationEvent[];
}

export type ApplicationStatus =
  | "Submitted"
  | "Viewed"
  | "Under Review"
  | "Interview"
  | "Offer"
  | "Accepted"
  | "Not Selected"
  | "Withdrawn";

export interface ApplicationEvent {
  id: string;
  type: "submitted" | "viewed" | "status";
  label: string;
  createdAt: string;
}

export interface SavedJob {
  jobId: string;
  savedAt: string;
}

export interface StudentTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  dueDate?: string | null;
}

export interface StudentDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: string;
  opportunityId?: string | null;
  applicationId?: string | null;
}

export interface StudentActivity {
  id: string;
  title: string;
  organization: string;
  role: string;
  description: string;
  category: "extracurricular" | "volunteering" | "club" | "leadership";
  startDate?: string | null;
  endDate?: string | null;
}

export interface StudentAchievement {
  id: string;
  title: string;
  organization: string;
  description: string;
  achievedAt?: string | null;
  credentialUrl?: string | null;
}

export interface Account {
  role: "student" | "employer";
  email: string;
  userId?: string;
  businessName?: string | undefined;
  isAdmin?: boolean;
}

export type VerificationStatus = "unsubmitted" | "pending" | "approved" | "rejected";

export interface BusinessProfile {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  industry?: string | undefined;
  website?: string | undefined;
  contactEmail?: string | undefined;
  phone?: string | undefined;
  logoUrl?: string | undefined;
  socialLinks?: Record<string, string> | undefined;
  verificationStatus: VerificationStatus;
  verificationSubmittedAt?: string | undefined;
  verificationReviewedAt?: string | undefined;
  verificationNotes?: string | undefined;
}

export type OpportunityReportReason =
  "Suspicious/scam" | "Incorrect information" | "No longer available" | "Inappropriate";

export interface OpportunityReport {
  id: string;
  jobId: string;
  reporterId?: string;
  reason: OpportunityReportReason;
  details?: string;
  createdAt: string;
}
