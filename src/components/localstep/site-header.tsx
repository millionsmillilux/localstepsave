import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLocalStep } from "@/lib/localstep/store";
import { cn } from "@/lib/utils";

const studentLinks = [
  { to: "/dashboard", label: "Command Center" },
  { to: "/discover", label: "Discover" },
  { to: "/my-steps", label: "My Steps" },
  { to: "/profile", label: "Profile" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { account, signOut, hydrated } = useLocalStep();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    signOut();
    void navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {account?.role !== "employer"
            ? studentLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname.startsWith(link.to) && "text-foreground",
              )}
              activeProps={{ className: "text-foreground" }}
            >
              {link.label}
            </Link>
          ))
            : (
              <>
                <Link to="/jobs" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Find Jobs</Link>
                <Link to="/internships" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Internships</Link>
                <Link to="/employers" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">For Employers</Link>
              </>
            )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {hydrated && account ? (
            <>
              {account.role === "employer" ? (
                <Link
                  to="/employer"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              ) : null}
              <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-xs">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="mt-2 flex flex-col gap-1 px-4">
              {(account?.role !== "employer" ? studentLinks : [
                { to: "/jobs", label: "Find Jobs" },
                { to: "/internships", label: "Internships" },
                { to: "/employers", label: "For Employers" },
              ]).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
              {account?.role === "employer" ? (
                <Link
                  to="/employer"
                  className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                >
                  Employer Dashboard
                </Link>
              ) : null}
              <div className="mt-4 flex flex-col gap-2">
                {hydrated && account ? (
                  <Button variant="outline" onClick={() => void handleSignOut()}>
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <Link to="/auth" search={{ mode: "signin" }}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link to="/auth" search={{ mode: "signup" }}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
