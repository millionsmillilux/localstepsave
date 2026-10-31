import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Job } from "./types";

export type JobEventType = "view" | "application";

export interface JobInterestRow {
  job_id: string;
  job_title: string | null;
  employer: string | null;
  views: number;
  applications: number;
  last_event_at: string | null;
}

/**
 * Records a job view or application in the database. Failures are swallowed so
 * analytics can never block a student from browsing or applying.
 */
export async function logJobEvent(job: Pick<Job, "id" | "title" | "employer">, eventType: JobEventType) {
  try {
    await supabase.from("job_events").insert({
      job_id: job.id,
      job_title: job.title,
      employer: job.employer,
      event_type: eventType,
    });
  } catch {
    // ignore analytics errors
  }
}

export async function fetchJobInterest(): Promise<JobInterestRow[]> {
  const { data, error } = await supabase.rpc("job_interest_summary");
  if (error) throw error;
  return (data ?? []) as unknown as JobInterestRow[];
}

export function useJobInterest() {
  return useQuery({
    queryKey: ["job-interest"],
    queryFn: fetchJobInterest,
    staleTime: 30_000,
  });
}
