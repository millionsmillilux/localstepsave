import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Container, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/verifications")({
  head: () => ({ meta: [{ title: "Verification queue | LocalStep" }] }),
  component: VerificationQueue,
});

function VerificationQueue() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [pending, setPending] = useState<Array<{ id: string; owner_id: string; name: string; location: string; description: string }>>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  useEffect(() => {
    void (async () => {
      const { data: admin } = await supabase.rpc("is_admin");
      setAuthorized(Boolean(admin));
      if (admin) {
        const { data } = await supabase.from("business_profiles").select("id,owner_id,name,location,description").eq("verification_status", "pending");
        setPending(data ?? []);
      }
    })();
  }, []);
  if (!authorized) return <SitePage><Container className="py-24 text-center"><h1 className="text-2xl font-semibold text-ink">{authorized === null ? "Loading…" : "Admin access required"}</h1></Container></SitePage>;
  return <SitePage><Container className="max-w-3xl py-10"><h1 className="text-2xl font-semibold text-ink">Employer verification queue</h1><p className="mt-2 text-sm text-muted-foreground">Review submitted business information before granting the verified badge.</p><div className="mt-8 space-y-4">{pending.length ? pending.map((profile) => <article key={profile.id} className="rounded-xl border border-border bg-surface p-5"><div className="flex justify-between gap-3"><div><h2 className="font-semibold text-ink">{profile.name}</h2><p className="text-sm text-muted-foreground">{profile.location} · {profile.owner_id}</p></div><Badge>Pending</Badge></div><p className="mt-3 text-sm text-muted-foreground">{profile.description || "No description provided."}</p><Textarea className="mt-4" placeholder="Optional review note" value={notes[profile.id] ?? ""} onChange={(event) => setNotes((prev) => ({ ...prev, [profile.id]: event.target.value }))} /><div className="mt-3 flex gap-2"><Button onClick={() => void review(profile.id, "approved")}>Approve</Button><Button variant="outline" onClick={() => void review(profile.id, "rejected")}>Reject</Button></div></article>) : <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No pending submissions.</p>}</div></Container></SitePage>;

  async function review(id: string, status: "approved" | "rejected") {
    const { error } = await supabase.from("business_profiles").update({ verification_status: status, verification_reviewed_at: new Date().toISOString(), verification_notes: notes[id] ?? null }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Employer ${status}`); setPending((rows) => rows.filter((row) => row.id !== id)); }
  }
}
