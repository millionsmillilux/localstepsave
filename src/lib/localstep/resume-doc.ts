import type {
  ResumeEntry,
  ResumeEntryCategory,
  StudentProfile,
  StudentResume,
} from "./types";

/** Format-neutral resume model shared by the live preview, PDF and DOCX exports. */
export interface ResumeDocItem {
  heading: string;
  sub?: string;
  dates?: string;
  bullets: string[];
}

export type ResumeDocSection =
  | { title: string; kind: "items"; items: ResumeDocItem[] }
  | { title: string; kind: "text"; text: string };

export interface ResumeDoc {
  name: string;
  contactLine: string;
  sections: ResumeDocSection[];
}

export const ENTRY_CATEGORIES: { value: ResumeEntryCategory; hint: string }[] = [
  { value: "School project", hint: "Science fair, group project, research, robotics build" },
  { value: "Club", hint: "Debate, coding club, yearbook, student council" },
  { value: "Scouts", hint: "Scouts BSA, Girl Scouts, merit badges, Eagle project" },
  { value: "Volunteering", hint: "Food bank, library, tutoring, church or community events" },
  { value: "Sports", hint: "School team, rec league, captain, team manager" },
  { value: "Leadership", hint: "Officer roles, mentoring, organizing an event" },
  { value: "Personal project", hint: "Website, app, art portfolio, small business, YouTube" },
  { value: "Work", hint: "Paid jobs, babysitting, lawn care, family business" },
];

const SECTION_GROUPS: { title: string; categories: ResumeEntryCategory[] }[] = [
  { title: "Experience", categories: ["Work"] },
  { title: "Projects", categories: ["School project", "Personal project"] },
  { title: "Leadership & Activities", categories: ["Leadership", "Club", "Scouts", "Sports"] },
  { title: "Volunteer Experience", categories: ["Volunteering"] },
];

export function newEntryId() {
  return `e_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function linesToBullets(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);
}

/** Fills wizard fields from the student's profile and any older free-text resume, without overwriting saved wizard data. */
export function prepareResumeDraft(resume: StudentResume, profile: StudentProfile): StudentResume {
  const legacy: [string, ResumeEntryCategory][] = [
    [resume.experience || profile.workExperience || profile.experience, "Work"],
    [resume.projects || profile.projects, "School project"],
    [resume.activities || profile.activities, "Club"],
    [resume.volunteerExperience || profile.volunteerExperience, "Volunteering"],
  ];
  const entries: ResumeEntry[] =
    resume.entries ??
    legacy
      .filter(([text]) => text?.trim())
      .map(([text, category]) => ({
        id: newEntryId(),
        category,
        title: category === "Work" ? "Experience" : category,
        organization: "",
        dates: "",
        bullets: linesToBullets(text),
      }));
  return {
    ...resume,
    skills: resume.skills.length ? resume.skills : profile.skills,
    awards: resume.awards || profile.awards,
    availability: resume.availability || profile.availability.join(", "),
    contact: {
      name: profile.name,
      location: profile.preferredLocation ?? "",
      ...resume.contact,
    },
    education: {
      school: profile.school,
      graduationYear: profile.graduationYear,
      ...resume.education,
    },
    entries,
  };
}

export function buildResumeDoc(resume: StudentResume): ResumeDoc {
  const c = resume.contact ?? {};
  const e = resume.education ?? {};
  const sections: ResumeDocSection[] = [];
  if (resume.summary.trim()) sections.push({ title: "Summary", kind: "text", text: resume.summary.trim() });

  if (e.school?.trim()) {
    const bullets = [
      e.gpa?.trim() ? `GPA: ${e.gpa.trim()}` : "",
      e.coursework?.trim() ? `Relevant coursework: ${e.coursework.trim()}` : "",
    ].filter(Boolean);
    sections.push({
      title: "Education",
      kind: "items",
      items: [{ heading: e.school.trim(), dates: e.graduationYear ? `Class of ${e.graduationYear}` : "", bullets }],
    });
  }

  const entries = (resume.entries ?? []).filter((x) => x.title.trim() || x.bullets.some((b) => b.trim()));
  for (const group of SECTION_GROUPS) {
    const items = entries
      .filter((x) => group.categories.includes(x.category))
      .map((x) => ({
        heading: x.title.trim() || x.category,
        sub: x.organization.trim(),
        dates: x.dates.trim(),
        bullets: x.bullets.map((b) => b.trim()).filter(Boolean),
      }));
    if (items.length) sections.push({ title: group.title, kind: "items", items });
  }

  const skills = resume.skills.map((s) => s.trim()).filter(Boolean);
  if (skills.length) sections.push({ title: "Skills", kind: "text", text: skills.join(", ") });
  if (resume.awards.trim()) {
    sections.push({
      title: "Awards & Certifications",
      kind: "items",
      items: [{ heading: "", bullets: linesToBullets(resume.awards) }],
    });
  }
  if (resume.availability.trim()) sections.push({ title: "Availability", kind: "text", text: resume.availability.trim() });

  return {
    name: c.name?.trim() || "Your Name",
    contactLine: [c.email, c.phone, c.location, c.link].map((x) => x?.trim()).filter(Boolean).join("  |  "),
    sections,
  };
}

const STRONG_VERBS = /^(led|organized|built|created|designed|developed|coordinated|managed|supported|helped|assisted|planned|taught|tutored|mentored|collected|served|trained|wrote|researched|presented|completed|earned|raised|volunteered|competed|maintained|prepared|launched)\b/i;

/** Offline rewrite: tidies wording only — never adds facts or numbers. */
export function tidyBullet(text: string): string {
  let v = text.trim().replace(/^[•\-*]\s*/, "");
  if (!v) return "";
  v = v.replace(/^(i|we)\s+(was|were)\s+/i, "").replace(/^(i|we)\s+/i, "");
  v = v.replace(/^(responsible for|in charge of)\s+/i, "Managed ");
  v = v.replace(/^helped (to )?/i, "Helped ");
  v = v.charAt(0).toUpperCase() + v.slice(1);
  if (!STRONG_VERBS.test(v) && /^(a|an|the|my|our)\b/i.test(v)) v = `Contributed to ${v.charAt(0).toLowerCase()}${v.slice(1)}`;
  return v.replace(/[.\s]+$/, "");
}
