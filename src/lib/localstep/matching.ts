import type { Job, StudentProfile } from "./types";
import { getOpportunityDistance } from "./geo";

export interface MatchBreakdown {
  age: number;
  location: number;
  availability: number;
  interests: number;
  experience: number;
  skills: number;
  careerGoals: number;
  total: number;
}

export interface OpportunityMatch {
  score: number;
  label: string;
  breakdown: MatchBreakdown;
  reasons: string[];
  matchSummary: string;
}

export function profileHasData(profile: Partial<StudentProfile>): boolean {
  const hasLists = [
    profile.interests,
    profile.skills,
    profile.availability,
    profile.jobTypes,
    profile.categories,
  ].some((value) => Array.isArray(value) && value.length > 0);
  const hasProfileDetails = Boolean(
    profile.preferredLocation?.trim() ||
    profile.bio?.trim() ||
    profile.experience?.trim() ||
    profile.activities?.trim() ||
    profile.graduationYear?.trim() ||
    typeof profile.age === "number" ||
    (typeof profile.preferredDistance === "number" && profile.preferredDistance > 0),
  );
  return hasLists || hasProfileDetails;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value: string | undefined | null) {
  return (value ?? "").trim().toLowerCase();
}

function findNormalizedMatches(text: string, values: string[]) {
  const normalizedText = normalizeText(text);
  return values.filter((value) => {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) return false;
    return normalizedText.includes(normalizedValue);
  });
}

function inferStudentAge(profile: StudentProfile) {
  if (typeof profile.age === "number" && Number.isFinite(profile.age)) return profile.age;
  const graduationYear = Number.parseInt(profile.graduationYear ?? "", 10);
  if (Number.isFinite(graduationYear)) {
    return new Date().getFullYear() - graduationYear + 18;
  }
  return null;
}

function getScheduleOverlap(profile: StudentProfile, job: Job) {
  const studentSchedules = (profile.availability ?? []).map((item) => normalizeText(item));
  if (studentSchedules.length === 0) return null;
  const jobSchedule = normalizeText(job.schedule);
  const direct = studentSchedules.find(
    (item) => item === jobSchedule || item.includes(jobSchedule) || jobSchedule.includes(item),
  );
  if (direct) return direct;
  if (
    jobSchedule.includes("after school") &&
    studentSchedules.some((item) => item.includes("after school"))
  ) {
    return "after school";
  }
  if (
    jobSchedule.includes("weekend") &&
    studentSchedules.some((item) => item.includes("weekend"))
  ) {
    return "weekends";
  }
  if (jobSchedule.includes("summer") && studentSchedules.some((item) => item.includes("summer"))) {
    return "summer";
  }
  if (jobSchedule === "flexible" && studentSchedules.some((item) => item.includes("flexible"))) {
    return "flexible";
  }
  return null;
}

function scoreAge(profile: StudentProfile, job: Job) {
  const minimumAge = typeof job.minimumAge === "number" ? job.minimumAge : null;
  const maximumAge = typeof job.maximumAge === "number" ? job.maximumAge : null;
  const studentAge = inferStudentAge(profile);

  if (!minimumAge && !maximumAge) return 20;
  if (studentAge === null) return 10;
  if (minimumAge && studentAge < minimumAge) return 0;
  if (maximumAge && studentAge > maximumAge) return 0;
  return 20;
}

function scoreLocation(profile: StudentProfile, job: Job) {
  const preferredDistance = Number.isFinite(profile.preferredDistance)
    ? profile.preferredDistance
    : 0;
  const distanceMiles = getOpportunityDistance(profile, job);

  if (!distanceMiles || !job.location) return 10;
  if (!preferredDistance) return 15;

  const transportationAdjustment =
    profile.transportation === "Walk" || profile.transportation === "Bike" ? 0.8 : 1;
  if (distanceMiles <= preferredDistance * transportationAdjustment) return 20;
  if (distanceMiles <= preferredDistance * 1.5) return 15;
  if (distanceMiles <= preferredDistance * 2) return 10;
  if (distanceMiles <= preferredDistance * 3) return 5;
  return 0;
}

function scoreAvailability(profile: StudentProfile, job: Job) {
  const studentAvailability = profile.availability ?? [];
  if (!studentAvailability.length) return 10;
  const overlap = getScheduleOverlap(profile, job);
  if (overlap) return 20;

  const scheduleText = normalizeText(job.schedule);
  const flexibleStudent = studentAvailability.some((item) =>
    normalizeText(item).includes("flexible"),
  );
  if (scheduleText === "flexible" && flexibleStudent) return 20;
  if (
    scheduleText.includes("after school") &&
    studentAvailability.some((item) => normalizeText(item).includes("after school"))
  )
    return 18;
  if (
    scheduleText.includes("weekend") &&
    studentAvailability.some((item) => normalizeText(item).includes("weekend"))
  )
    return 16;
  if (
    scheduleText.includes("summer") &&
    studentAvailability.some((item) => normalizeText(item).includes("summer"))
  )
    return 18;
  return 0;
}

function scoreInterests(profile: StudentProfile, job: Job) {
  const interestTerms = (profile.interests ?? []).filter(Boolean);
  if (!interestTerms.length) return 10;

  const target = [
    job.title,
    job.category,
    job.summary,
    job.description,
    job.employer,
    ...(job.tags ?? []),
    ...(job.requirements ?? []),
    ...(job.lookingFor ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const matches = interestTerms.filter((interest) => {
    const normalizedInterest = normalizeText(interest);
    if (!normalizedInterest) return false;
    return (
      target.includes(normalizedInterest) || target.includes(normalizedInterest.replace(/\s+/g, ""))
    );
  });

  if (!matches.length) return 4;
  return clamp(Math.round((matches.length / Math.max(1, interestTerms.length)) * 20), 8, 20);
}

function scoreExperience(profile: StudentProfile, job: Job) {
  const text = normalizeText(job.experience);
  const hasStudentExperience = normalizeText(profile.experience).length > 0;

  if (!text) return 10;
  if (text.includes("no experience required")) return hasStudentExperience ? 10 : 10;
  if (text.includes("training provided")) return hasStudentExperience ? 10 : 9;
  if (text.includes("some experience preferred")) return hasStudentExperience ? 10 : 6;
  return 10;
}

function scoreSkills(profile: StudentProfile, job: Job) {
  const studentSkills = (profile.skills ?? []).filter(Boolean);
  const sourceText = [
    job.title,
    job.category,
    job.summary,
    job.description,
    ...(job.lookingFor ?? []),
    ...(job.requirements ?? []),
    ...(job.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (!studentSkills.length) return 5;

  const matchedSkills = studentSkills.filter((skill) => {
    const normalizedSkill = normalizeText(skill).replace(/\s+/g, " ");
    if (!normalizedSkill) return false;
    return (
      sourceText.includes(normalizedSkill) ||
      sourceText.includes(normalizedSkill.replace(/\s+/g, ""))
    );
  });

  if (!matchedSkills.length) return 4;
  return clamp(Math.round((matchedSkills.length / Math.max(1, studentSkills.length)) * 10), 5, 10);
}

function scoreCareerGoals(profile: StudentProfile, job: Job) {
  const typeMatch = (profile.jobTypes ?? []).some(
    (type) => normalizeText(type) === normalizeText(job.employmentType),
  );
  const categoryMatch = (profile.categories ?? []).some(
    (category) => normalizeText(category) === normalizeText(job.category),
  );
  const goalText = [job.title, job.category, job.employer, job.summary, ...(job.tags ?? [])]
    .join(" ")
    .toLowerCase();
  const expandedGoalMatch = (profile.careerGoals ?? []).some((goal) =>
    goalText.includes(normalizeText(goal)),
  );
  if (!profile.jobTypes?.length && !profile.categories?.length && !profile.careerGoals?.length) {
    return 8;
  }
  return (
    Math.min(15, (typeMatch ? 8 : 0) + (categoryMatch ? 7 : 0) + (expandedGoalMatch ? 3 : 0)) || 3
  );
}

function getMatchLabel(score: number) {
  if (score >= 85) return "Great fit for you";
  if (score >= 70) return "Good fit";
  if (score >= 50) return "Fair match";
  return "Some requirements may not fit";
}

function getReasonStrings(profile: StudentProfile, job: Job, breakdown: MatchBreakdown): string[] {
  const reasons: string[] = [];
  const studentAge = inferStudentAge(profile);
  const preferredDistance = Number.isFinite(profile.preferredDistance)
    ? profile.preferredDistance
    : null;
  const distance = getOpportunityDistance(profile, job);
  const matchedAvailability = getScheduleOverlap(profile, job);

  if (breakdown.age >= 18) {
    reasons.push("You're within the listed age range");
  }

  if (distance !== null && preferredDistance && distance <= preferredDistance) {
    reasons.push(`${distance.toFixed(1)} miles from your preferred area`);
  } else if (distance !== null && preferredDistance && distance <= preferredDistance * 1.5) {
    reasons.push(`${distance.toFixed(1)} miles from your preferred area`);
  }

  if (matchedAvailability) {
    reasons.push(`Fits your ${matchedAvailability} availability`);
  }

  const interestMatches = (profile.interests ?? []).filter((interest) => {
    const target = [job.title, job.category, job.summary, job.description, ...(job.tags ?? [])]
      .join(" ")
      .toLowerCase();
    return target.includes(normalizeText(interest));
  });
  if (interestMatches.length > 0 && breakdown.interests >= 8) {
    reasons.push(`Matches your interest in ${interestMatches[0]}`);
  }

  const hasNoExperienceRequirement = normalizeText(job.experience).includes(
    "no experience required",
  );
  if (hasNoExperienceRequirement) {
    reasons.push("No previous experience required");
  }

  const matchedSkills = (profile.skills ?? []).filter((skill) => {
    const text = [
      job.title,
      job.category,
      job.summary,
      job.description,
      ...(job.requirements ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return text.includes(normalizeText(skill));
  });
  if (matchedSkills.length > 0 && breakdown.skills >= 4) {
    reasons.push(`Matches your skills in ${matchedSkills[0]}`);
  }

  const categoryGoal = (profile.categories ?? []).find(
    (category) => normalizeText(category) === normalizeText(job.category),
  );
  const typeGoal = (profile.jobTypes ?? []).find(
    (type) => normalizeText(type) === normalizeText(job.employmentType),
  );
  if (categoryGoal) reasons.push(`Fits your ${categoryGoal} career interests`);
  else if (typeGoal) reasons.push(`Matches your goal for ${typeGoal} work`);

  const expandedGoal = (profile.careerGoals ?? []).find((goal) =>
    [job.title, job.category, job.employer, job.summary, ...(job.tags ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(normalizeText(goal)),
  );
  if (expandedGoal) reasons.push(`Supports your goal to ${expandedGoal}`);

  if (
    studentAge !== null &&
    job.minimumAge &&
    studentAge >= job.minimumAge &&
    (!job.maximumAge || studentAge <= job.maximumAge)
  ) {
    reasons.push("Your age fits the role's requirements");
  }

  if (reasons.length < 3 && profile.name?.trim()) {
    reasons.push(`You have a strong fit for ${job.employer}`);
  }

  return reasons.slice(0, 5);
}

export function getOpportunityMatch(profile: StudentProfile, job: Job): OpportunityMatch | null {
  if (!profileHasData(profile)) return null;

  const breakdown: MatchBreakdown = {
    age: scoreAge(profile, job),
    location: scoreLocation(profile, job),
    availability: scoreAvailability(profile, job),
    interests: scoreInterests(profile, job),
    experience: scoreExperience(profile, job),
    skills: scoreSkills(profile, job),
    careerGoals: scoreCareerGoals(profile, job),
    total: 0,
  };

  const rawTotal =
    breakdown.age +
    breakdown.location +
    breakdown.availability +
    breakdown.interests +
    breakdown.experience +
    breakdown.skills +
    breakdown.careerGoals;
  breakdown.total = Math.round((rawTotal / 115) * 100);

  const reasons = getReasonStrings(profile, job, breakdown);
  const score = clamp(breakdown.total, 0, 100);

  return {
    score,
    label: getMatchLabel(score),
    breakdown,
    reasons,
    matchSummary: `${score}% Match`,
  };
}

export function isOpportunityAvailable(job: Job) {
  if (job.active === false) return false;
  if (job.deadline) {
    const deadline = new Date(job.deadline);
    if (!Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()) return false;
  }
  return true;
}

export function sortJobsByMatch(profile: StudentProfile, jobs: Job[]) {
  return [...jobs].sort((a, b) => {
    const left = getOpportunityMatch(profile, a)?.score ?? 0;
    const right = getOpportunityMatch(profile, b)?.score ?? 0;
    if (left !== right) return right - left;
    return (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0);
  });
}

export function getRecommendedJobs(profile: StudentProfile, jobs: Job[]) {
  return sortJobsByMatch(
    profile,
    jobs.filter((job) => isOpportunityAvailable(job)),
  ).filter((job) => {
    const score = getOpportunityMatch(profile, job)?.score ?? 0;
    return score > 0;
  });
}

export function getStudentOpportunityMatches(profile: StudentProfile, jobs: Job[]) {
  return jobs
    .filter(isOpportunityAvailable)
    .map((job) => ({ job, match: getOpportunityMatch(profile, job) }))
    .filter((item): item is { job: Job; match: OpportunityMatch } => item.match !== null)
    .sort((a, b) => b.match.score - a.match.score);
}
