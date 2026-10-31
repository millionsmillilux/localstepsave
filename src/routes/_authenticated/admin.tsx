import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Search, Users, BriefcaseBusiness, Flag, ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { supabase } from "@/integrations/supabase/client";

type Tab = "overview" | "employers" | "opportunities" | "reports" | "students" | "audit";
type AdminRow = {
  id?: unknown;
  owner_id?: unknown;
  title?: unknown;
  name?: unknown;
  location?: unknown;
  employer_name?: unknown;
  verification_status?: unknown;
  account_status?: unknown;
  status?: unknown;
  role?: unknown;
  job_id?: unknown;
  reason?: unknown;
  details?: unknown;
  display_name?: unknown;
  created_at?: unknown;
  item_type?: unknown;
  item_id?: unknown;
  action?: unknown;
};
type Counts = { employers: number; opportunities: number; applications: number; pendingEmployers: number; pendingOpportunities: number; reports: number };
type AdminData = {
  employers: AdminRow[];
  opportunities: AdminRow[];
  reports: AdminRow[];
  students: AdminRow[];
  audit: AdminRow[];
  counts: Counts;
};

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin moderation | LocalStep" }] }),
  component: AdminPage,
});

const labelStatus = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function Status({ value }: { value: string }) {
  const variant = ["approved", "active", "resolved"].includes(value) ? "default" : value === "rejected" || value === "suspended" ? "destructive" : "secondary";
  return <Badge variant={variant}>{labelStatus(value)}</Badge>;
}

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<AdminData | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
    if (roleError || !isAdmin) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    setAuthorized(true);
    const [employers, opportunities, reports, students, audit, applications] = await Promise.all([
      supabase.from("business_profiles").select("id,owner_id,name,location,verification_status,verification_submitted_at,account_status").order("created_at", { ascending: false }),
      supabase.from("opportunities").select("id,owner_id,title,employer_name,location,status,created_at,review_notes").order("created_at", { ascending: false }),
      supabase.from("opportunity_reports").select("id,job_id,reporter_id,reason,details,status,created_at").order("created_at", { ascending: false }),
      supabase.from("user_profiles").select("id,role,display_name,account_status,created_at").eq("role", "student").order("created_at", { ascending: false }),
      supabase.from("admin_audit_log").select("id,admin_id,action,item_type,item_id,details,created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("applications").select("id", { count: "exact", head: true }),
    ]);
    const firstError = [employers, opportunities, reports, students, audit, applications].find((result) => result.error)?.error;
    if (firstError) {
      toast.error(firstError.message);
    } else {
      const employerRows = employers.data ?? [];
      const opportunityRows = opportunities.data ?? [];
      const reportRows = reports.data ?? [];
      setData({
        employers: employerRows,
        opportunities: opportunityRows,
        reports: reportRows,
        students: students.data ?? [],
        audit: audit.data ?? [],
        counts: {
          employers: employerRows.length,
          opportunities: opportunityRows.filter((item) => item.status === "active").length,
          applications: applications.count ?? 0,
          pendingEmployers: employerRows.filter((item) => item.verification_status === "pending").length,
          pendingOpportunities: opportunityRows.filter((item) => item.status === "pending_review").length,
          reports: reportRows.filter((item) => item.status === "open").length,
        },
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => void load(), [load]);

  async function audit(action: string, itemType: string, itemId: string, details: Record<string, string> = {}) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Your session has expired.");
    const { error } = await supabase.from("admin_audit_log").insert({ admin_id: userData.user.id, action, item_type: itemType, item_id: itemId, details });
    if (error) throw error;
  }

  async function reviewEmployer(profile: AdminRow, status: "approved" | "rejected") {
    const id = String(profile.id);
    const { error } = await supabase.from("business_profiles").update({ verification_status: status, verification_reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    try {
      await supabase.from("verification_submissions").update({ status, reviewed_at: new Date().toISOString() }).eq("business_profile_id", id).eq("status", "pending");
      await audit(`${status === "approved" ? "Approved" : "Rejected"} employer`, "business_profile", id);
      await supabase.from("notifications").insert({ user_id: String(profile.owner_id), type: "employer_verification", title: `Employer verification ${status}`, body: status === "approved" ? "Your business is now verified." : "Your verification needs attention.", item_id: id });
      toast.success(`Employer ${status}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record admin action.");
    }
    return;
  }

  async function updateOpportunity(opportunity: AdminRow, status: "active" | "rejected" | "suspended") {
    const id = String(opportunity.id);
    const { error } = await supabase.from("opportunities").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    try {
      await audit(`${labelStatus(status)} opportunity`, "opportunity", id);
      await supabase.from("notifications").insert({ user_id: String(opportunity.owner_id), type: "opportunity_moderation", title: `Opportunity ${labelStatus(status)}`, body: `“${String(opportunity.title)}” is now ${labelStatus(status).toLowerCase()}.`, item_id: id });
      toast.success(`Opportunity ${labelStatus(status)}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record admin action.");
    }
    return;
  }

  async function editOpportunity(opportunity: AdminRow) {
    const currentTitle = String(opportunity.title);
    const title = window.prompt("Update opportunity title", currentTitle)?.trim();
    if (!title || title === currentTitle) return;
    const { error } = await supabase.from("opportunities").update({ title }).eq("id", String(opportunity.id));
    if (error) {
      toast.error(error.message);
      return;
    }
    try {
      await audit("Edited opportunity", "opportunity", String(opportunity.id), { title });
      toast.success("Opportunity updated");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record admin action.");
    }
    return;
  }

  async function resolveReport(report: AdminRow) {
    const id = String(report.id);
    const { error } = await supabase.from("opportunity_reports").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    try {
      await audit("Resolved report", "opportunity_report", id);
      toast.success("Report resolved");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record admin action.");
    }
    return;
  }

  async function setAccountStatus(row: AdminRow, status: "active" | "suspended") {
    const isEmployer = row.role === undefined;
    const result = isEmployer
      ? await supabase.from("business_profiles").update({ account_status: status }).eq("id", String(row.id))
      : await supabase.from("user_profiles").update({ account_status: status }).eq("id", String(row.id));
    const { error } = result;
      if (error) {
        toast.error(error.message);
        return;
      }
      try {
        await audit(`${status === "suspended" ? "Suspended" : "Reactivated"} account`, isEmployer ? "business_profile" : "user_profile", String(row.id));
        toast.success(status === "suspended" ? "Account suspended" : "Account reactivated");
        await load();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not record admin action.");
      }
    return;
  }

  if (loading) return <SitePage><Container className="py-16"><p className="text-muted-foreground">Loading secure admin workspace...</p></Container></SitePage>;
  if (!authorized) return <SitePage><Container className="py-16"><EmptyState title="Admin access required" description="This area is restricted to authorized LocalStep administrators. Sign in with an admin account to continue." /></Container></SitePage>;
  if (!data) return null;

  const filtered = (rows: AdminRow[]) => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const nav: Array<[Tab, string]> = [["overview", "Overview"], ["employers", "Employers"], ["opportunities", "Opportunities"], ["reports", "Reports"], ["students", "Students"], ["audit", "Audit log"]];
  return (
    <SitePage>
      <Container className="py-8 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Operations</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Admin dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Review marketplace activity and protect the LocalStep community.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm"><ShieldCheck className="size-4 text-success" /> Secure admin session</div>
        </div>
        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-border pb-px">{nav.map(([value, label]) => <Button key={value} variant={tab === value ? "default" : "ghost"} onClick={() => { setTab(value); setQuery(""); }}>{label}</Button>)}</div>
        {tab === "overview" ? <Overview counts={data.counts} onSelect={setTab} /> : <section className="mt-6"><div className="mb-4 flex max-w-md items-center gap-2"><Search className="size-4 text-muted-foreground" /><Input placeholder={`Search ${tab}...`} value={query} onChange={(event) => setQuery(event.target.value)} /></div>{tab === "employers" && <Employers rows={filtered(data.employers)} onReview={reviewEmployer} onStatus={setAccountStatus} />}{tab === "opportunities" && <Opportunities rows={filtered(data.opportunities)} onUpdate={updateOpportunity} onEdit={editOpportunity} />}{tab === "reports" && <Reports rows={filtered(data.reports)} onResolve={resolveReport} />}{tab === "students" && <Students rows={filtered(data.students)} onStatus={setAccountStatus} />}{tab === "audit" && <Audit rows={data.audit} />}</section>}
        <Outlet />
      </Container>
    </SitePage>
  );
}

function Overview({ counts, onSelect }: { counts: Counts; onSelect: (tab: Tab) => void }) {
  const cards = [["Total employers", counts.employers, "employers", Users], ["Active opportunities", counts.opportunities, "opportunities", BriefcaseBusiness], ["Total applications", counts.applications, "applications", ClipboardList], ["Pending verifications", counts.pendingEmployers, "employers", ShieldCheck], ["Pending approvals", counts.pendingOpportunities, "opportunities", BriefcaseBusiness], ["Open reports", counts.reports, "reports", Flag]] as const;
  return <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value, tab, Icon]) => <Card key={label} className="cursor-pointer transition-shadow hover:shadow-raised" onClick={() => onSelect(tab as Tab)}><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><Icon className="size-4 text-primary" /></CardHeader><CardContent><p className="text-3xl font-semibold text-ink">{value}</p><p className="mt-1 text-xs text-muted-foreground">Live database count</p></CardContent></Card>)}</div>;
}

function Employers({ rows, onReview, onStatus }: { rows: AdminRow[]; onReview: (row: AdminRow, status: "approved" | "rejected") => void; onStatus: (row: AdminRow, status: "active" | "suspended") => void }) {
  if (!rows.length) return <EmptyState title="No employers found" description="Employer business profiles will appear here when they register." />;
  return <div className="grid gap-3">{rows.map((row) => <Card key={String(row.id)}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-semibold text-ink">{String(row.name)}</h2><p className="text-sm text-muted-foreground">{String(row.location || "Location not provided")}</p></div><div className="flex items-center gap-2"><Status value={String(row.verification_status)} />{row.verification_status === "pending" && <><Button size="sm" onClick={() => onReview(row, "approved")}>Approve</Button><Button size="sm" variant="destructive" onClick={() => onReview(row, "rejected")}>Reject</Button></>}{row.account_status === "suspended" ? <Button size="sm" variant="outline" onClick={() => onStatus(row, "active")}>Reactivate</Button> : <Button size="sm" variant="destructive" onClick={() => onStatus(row, "suspended")}>Suspend</Button>}</div></CardContent></Card>)}</div>;
}

function Opportunities({ rows, onUpdate, onEdit }: { rows: AdminRow[]; onUpdate: (row: AdminRow, status: "active" | "rejected" | "suspended") => void; onEdit: (row: AdminRow) => void }) {
  const [status, setStatus] = useState("all");
  const visible = useMemo(() => status === "all" ? rows : rows.filter((row) => row.status === status), [rows, status]);
  return <><div className="mb-4 max-w-xs"><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue placeholder="Filter status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{["pending_review", "active", "rejected", "suspended", "expired"].map((value) => <SelectItem key={value} value={value}>{labelStatus(value)}</SelectItem>)}</SelectContent></Select></div>{!visible.length ? <EmptyState title="No opportunities found" description="Listings submitted by approved employers will appear here for review." /> : <div className="grid gap-3">{visible.map((row) => <Card key={String(row.id)}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-semibold text-ink">{String(row.title)}</h2><p className="text-sm text-muted-foreground">{String(row.employer_name)} · {String(row.location || "Location not provided")}</p></div><div className="flex flex-wrap items-center gap-2"><Status value={String(row.status)} /><Button size="sm" variant="outline" onClick={() => onEdit(row)}>Edit</Button>{row.status === "pending_review" && <><Button size="sm" onClick={() => onUpdate(row, "active")}>Approve</Button><Button size="sm" variant="destructive" onClick={() => onUpdate(row, "rejected")}>Reject</Button></>}{row.status === "active" && <Button size="sm" variant="destructive" onClick={() => onUpdate(row, "suspended")}>Suspend</Button>}</div></CardContent></Card>)}</div>}</>;
}

function Reports({ rows, onResolve }: { rows: AdminRow[]; onResolve: (row: AdminRow) => void }) {
  if (!rows.length) return <EmptyState title="No reports found" description="Reports submitted by students will appear here." />;
  return <div className="grid gap-3">{rows.map((row) => <Card key={String(row.id)}><CardContent className="flex flex-wrap items-start justify-between gap-4 p-5"><div><div className="flex items-center gap-2"><Status value={String(row.status)} /><span className="text-xs text-muted-foreground">Opportunity {String(row.job_id)}</span></div><h2 className="mt-2 font-semibold text-ink">{String(row.reason)}</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{String(row.details || "No additional details provided.")}</p></div>{row.status === "open" && <Button size="sm" onClick={() => onResolve(row)}>Resolve</Button>}</CardContent></Card>)}</div>;
}

function Students({ rows, onStatus }: { rows: AdminRow[]; onStatus: (row: AdminRow, status: "active" | "suspended") => void }) {
  if (!rows.length) return <EmptyState title="No students found" description="Registered students will appear here with limited profile information." />;
  return <div className="grid gap-3">{rows.map((row) => <Card key={String(row.id)}><CardContent className="flex items-center justify-between gap-4 p-5"><div><h2 className="font-semibold text-ink">{String(row.display_name || "Student")}</h2><p className="text-xs text-muted-foreground">Joined {new Date(String(row.created_at)).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><Status value={String(row.account_status)} />{row.account_status === "suspended" ? <Button size="sm" variant="outline" onClick={() => onStatus(row, "active")}>Reactivate</Button> : <Button size="sm" variant="destructive" onClick={() => onStatus(row, "suspended")}>Suspend</Button>}</div></CardContent></Card>)}</div>;
}

function Audit({ rows }: { rows: AdminRow[] }) {
  if (!rows.length) return <EmptyState title="No activity yet" description="Admin actions will be recorded here." />;
  return <div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="p-4">Action</th><th className="p-4">Item</th><th className="p-4">Date</th></tr></thead><tbody>{rows.map((row) => <tr key={String(row.id)} className="border-b border-border last:border-0"><td className="p-4 font-medium text-ink">{String(row.action)}</td><td className="p-4 text-muted-foreground">{String(row.item_type)} · {String(row.item_id || "—")}</td><td className="p-4 text-muted-foreground">{new Date(String(row.created_at)).toLocaleString()}</td></tr>)}</tbody></table></div>;
}
