import type { Job, StudentProfile } from "./types";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Coordinates are deliberately limited to public city/ZIP centroids. Precise
// student location is never required or stored.
const knownLocations: Record<string, Coordinates> = {
  "barrington, il": { latitude: 42.1539, longitude: -88.1362 },
  "palatine, il": { latitude: 42.1103, longitude: -88.0342 },
  "lake zurich, il": { latitude: 42.1969, longitude: -88.0934 },
  "crystal lake, il": { latitude: 42.2411, longitude: -88.3162 },
  "60010": { latitude: 42.1539, longitude: -88.1362 },
  "60067": { latitude: 42.1103, longitude: -88.0342 },
  "60047": { latitude: 42.1969, longitude: -88.0934 },
};

export function getCoordinates(value?: string): Coordinates | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  const exact = knownLocations[normalized];
  if (exact) return exact;
  const city = Object.keys(knownLocations).find((key) => normalized.includes(key));
  return city ? (knownLocations[city] ?? null) : null;
}

export function getJobCoordinates(job: Job): Coordinates | null {
  if (typeof job.latitude === "number" && typeof job.longitude === "number") {
    return { latitude: job.latitude, longitude: job.longitude };
  }
  return getCoordinates(job.location) ?? null;
}

export function haversineMiles(from: Coordinates, to: Coordinates) {
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getOpportunityDistance(profile: StudentProfile, job: Job) {
  const origin = getCoordinates(profile.preferredLocation);
  const destination =
    typeof job.latitude === "number" && typeof job.longitude === "number"
      ? { latitude: job.latitude, longitude: job.longitude }
      : null;
  if (origin && destination) return haversineMiles(origin, destination);
  return typeof job.distanceMiles === "number" && Number.isFinite(job.distanceMiles)
    ? job.distanceMiles
    : null;
}

export function formatDistance(distance: number | null) {
  if (distance === null) return "Distance unavailable";
  return `${distance < 10 ? distance.toFixed(1) : Math.round(distance)} miles away`;
}
