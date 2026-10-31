import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Container, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useLocalStep } from "@/lib/localstep/store";

type Mode = "signin" | "signup";
type Role = "student" | "employer";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): {
    mode: Mode;
    oauth?: string | undefined;
    role?: Role | undefined;
    error?: string | undefined;
    errorDescription?: string | undefined;
  } => ({
    mode: search['mode'] === "signin" ? "signin" : "signup",
    oauth: typeof search['oauth'] === "string" ? search['oauth'] : undefined,
    role: search['role'] === "employer" ? "employer" : search['role'] === "student" ? "student" : undefined,
    error: typeof search['error'] === "string" ? search['error'] : undefined,
    errorDescription: typeof search['error_description'] === "string" ? search['error_description'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account | LocalStep" },
      { name: "description", content: "Create a LocalStep account as a student or as a local employer." },
      { property: "og:title", content: "Sign in or create an account | LocalStep" },
      { property: "og:description", content: "Create a LocalStep account as a student or as a local employer." },
    ],
  }),
  component: AuthPage,
});

const PENDING_ROLE_KEY = "localstep:pending-role";

/** Ensure the account has a role (new Google users have none yet) and return it. */
async function resolveRole(preferred: Role): Promise<Role> {
  const { data } = await supabase.auth.getUser();
  const existing = data.user?.user_metadata?.["role"];
  if (existing === "employer" || existing === "student") return existing;
  // First sign-in: record the chosen role once. Later logins never overwrite it.
  const { error } = await supabase.auth.updateUser({ data: { role: preferred } });
  if (error) throw error;
  return preferred;
}

function AuthPage() {
  const { mode, error: oauthError, errorDescription } = Route.useSearch();
  const navigate = useNavigate();
  const { account } = useLocalStep();
  const [oauthLoading, setOauthLoading] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [employerPassword, setEmployerPassword] = useState("");

  const heading = mode === "signin" ? "Welcome back" : "Get started on LocalStep";

  useEffect(() => {
    if (oauthError) toast.error(errorDescription || "Google sign-in was cancelled or could not be completed.");
  }, [oauthError, errorDescription]);

  // After a Google redirect returns (or any existing session), route to the right dashboard.
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return;
      const pending = sessionStorage.getItem(PENDING_ROLE_KEY) as Role | null;
      sessionStorage.removeItem(PENDING_ROLE_KEY);
      try {
        const role = await resolveRole(pending ?? "student");
        if (active) void navigate({ to: role === "employer" ? "/employer" : "/dashboard", replace: true });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't finish setting up your account.");
      }
    });
    return () => {
      active = false;
    };
  }, [navigate, account?.userId]);

  async function continueWithGoogle(accountRole: Role) {
    setOauthLoading(accountRole);
    sessionStorage.setItem(PENDING_ROLE_KEY, accountRole);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?mode=signin`,
    });
    if (result.redirected) return;
    setOauthLoading(null);
    if (result.error) {
      sessionStorage.removeItem(PENDING_ROLE_KEY);
      toast.error(result.error.message || "Google sign-in was cancelled.");
      return;
    }
    try {
      sessionStorage.removeItem(PENDING_ROLE_KEY);
      const role = await resolveRole(accountRole);
      toast.success("Signed in with Google");
      void navigate({ to: role === "employer" ? "/employer" : "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't finish setting up your account.");
    }
  }

  if (checkEmail) {
    return (
      <SitePage>
        <Container className="max-w-lg py-14">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Check your email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{checkEmail}</strong>. Click it to activate your account, then sign in.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => setCheckEmail(null)}>Back to sign in</Button>
        </Container>
      </SitePage>
    );
  }

  return (
    <SitePage>
      <Container className="max-w-lg py-14">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{heading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Students always use LocalStep for free. Employers pay only to feature a listing.
        </p>

        <Tabs defaultValue="student" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">I'm a Student</TabsTrigger>
            <TabsTrigger value="employer">I'm an Employer</TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <form
              className="space-y-4 rounded-xl border border-border bg-surface p-6"
              onSubmit={(event) => {
                event.preventDefault();
                void continueWithPassword("student");
              }}
            >
              <div>
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  required
                  className="mt-1.5"
                  value={studentEmail}
                  onChange={(event) => setStudentEmail(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="student-password">Password</Label>
                <Input
                  id="student-password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1.5"
                  value={studentPassword}
                  onChange={(event) => setStudentPassword(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {mode === "signin" ? "Sign In" : "Create student account"}
              </Button>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-surface px-2 text-xs text-muted-foreground">or</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full" disabled={oauthLoading !== null} onClick={() => void continueWithGoogle("student")}>
                {oauthLoading === "student" ? "Connecting..." : "Continue with Google"}
              </Button>
              <p className="text-xs text-muted-foreground">
                We only ask for an email and password. LocalStep never asks students for sensitive personal
                information.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="employer">
            <form
              className="space-y-4 rounded-xl border border-border bg-surface p-6"
              onSubmit={(event) => {
                event.preventDefault();
                void continueWithPassword("employer");
              }}
            >
              <div>
                <Label htmlFor="business-name">Business name</Label>
                <Input
                  id="business-name"
                  required
                  className="mt-1.5"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="employer-email">Email</Label>
                <Input
                  id="employer-email"
                  type="email"
                  required
                  className="mt-1.5"
                  value={employerEmail}
                  onChange={(event) => setEmployerEmail(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="employer-password">Password</Label>
                <Input
                  id="employer-password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1.5"
                  value={employerPassword}
                  onChange={(event) => setEmployerPassword(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {mode === "signin" ? "Sign In" : "Create employer account"}
              </Button>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-surface px-2 text-xs text-muted-foreground">or</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full" disabled={oauthLoading !== null} onClick={() => void continueWithGoogle("employer")}>
                {oauthLoading === "employer" ? "Connecting..." : "Continue with Google"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">Your account and data are stored securely.</p>
      </Container>
    </SitePage>
  );

  async function continueWithPassword(role: Role) {
    if (submitting) return;
    const email = role === "employer" ? employerEmail : studentEmail;
    const password = role === "employer" ? employerPassword : studentPassword;
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const actual = await resolveRole(role);
        toast.success("Signed in");
        void navigate({ to: actual === "employer" ? "/employer" : "/dashboard", replace: true });
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?mode=signin`,
          data: { role, ...(role === "employer" ? { company_name: businessName } : {}) },
        },
      });
      if (error) throw error;
      if (!data.session) {
        setCheckEmail(email);
        return;
      }
      toast.success("Account created");
      void navigate({ to: role === "employer" ? "/employer" : "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
}
