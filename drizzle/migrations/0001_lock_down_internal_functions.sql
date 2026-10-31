REVOKE EXECUTE ON FUNCTION public.prepare_application() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_application_identity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_application_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_user_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_opportunity_metric(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_opportunity_metric(text, text) TO authenticated;