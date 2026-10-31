import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Container, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStep } from "@/lib/localstep/store";

type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode } => ({
    mode: search['mode'] === "signin" ? "signin" : "signup",
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

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { signIn } = useLocalStep();
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [employerPassword, setEmployerPassword] = useState("");

  const heading = mode === "signin" ? "Welcome back" : "Get started on LocalStep";

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
                signIn({ role: "student", email: studentEmail });
                toast.success(mode === "signin" ? "Signed in" : "Student account created");
                void navigate({ to: "/jobs" });
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
              <Button type="submit" className="w-full">
                {mode === "signin" ? "Sign In" : "Create student account"}
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
                signIn({ role: "employer", email: employerEmail, businessName });
                toast.success(mode === "signin" ? "Signed in" : "Employer account created");
                void navigate({ to: "/employer" });
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
              <Button type="submit" className="w-full">
                {mode === "signin" ? "Sign In" : "Create employer account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prototype accounts are stored on this device only.
        </p>
      </Container>
    </SitePage>
  );
}
