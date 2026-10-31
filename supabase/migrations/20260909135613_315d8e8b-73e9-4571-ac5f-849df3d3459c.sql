CREATE TABLE public.job_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id text NOT NULL,
  job_title text,
  employer text,
  event_type text NOT NULL CHECK (event_type IN ('view','application')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX job_events_job_id_idx ON public.job_events (job_id);
CREATE INDEX job_events_created_at_idx ON public.job_events (created_at DESC);

GRANT INSERT ON public.job_events TO anon, authenticated;
GRANT ALL ON public.job_events TO service_role;

ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record job events"
  ON public.job_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.job_interest_summary()
RETURNS TABLE (job_id text, job_title text, employer text, views bigint, applications bigint, last_event_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.job_id,
    max(e.job_title) AS job_title,
    max(e.employer) AS employer,
    count(*) FILTER (WHERE e.event_type = 'view') AS views,
    count(*) FILTER (WHERE e.event_type = 'application') AS applications,
    max(e.created_at) AS last_event_at
  FROM public.job_events e
  GROUP BY e.job_id
  ORDER BY count(*) FILTER (WHERE e.event_type = 'view') DESC;
$$;

GRANT EXECUTE ON FUNCTION public.job_interest_summary() TO anon, authenticated, service_role;