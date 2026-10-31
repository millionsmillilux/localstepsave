GRANT SELECT ON public.job_events TO anon, authenticated;

CREATE POLICY "Anyone can read job events"
  ON public.job_events FOR SELECT TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.job_interest_summary()
RETURNS TABLE (job_id text, job_title text, employer text, views bigint, applications bigint, last_event_at timestamptz)
LANGUAGE sql
STABLE
SECURITY INVOKER
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