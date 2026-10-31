import { Link } from "@tanstack/react-router";

import { LogoMark } from "./logo";

const columns = [
  {
    heading: "Students",
    links: [
      { to: "/dashboard", label: "Student command center" },
      { to: "/discover", label: "Explore opportunities" },
      { to: "/internships", label: "Find Internships" },
      { to: "/profile", label: "Build your student profile" },
      { to: "/my-steps", label: "My Steps" },
      { to: "/applications", label: "Applications" },
      { to: "/saved", label: "Saved opportunities" },
      { to: "/resume", label: "Resume" },
    ],
  },
  {
    heading: "Employers",
    links: [
      { to: "/employer/jobs/new", label: "Post a Job" },
      { to: "/employer", label: "Employer Dashboard" },
      { to: "/employers", label: "For employers" },
    ],
  },
  {
    heading: "Company",
    links: [
      { to: "/schools", label: "Schools & Youth Orgs" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-ink">
            <LogoMark className="h-6 w-6 text-primary" />
            <span className="text-[1.0625rem] font-semibold tracking-tight">LocalStep</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Your next step starts here.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.heading}>
            <h2 className="text-sm font-semibold text-foreground">{column.heading}</h2>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 LocalStep. All rights reserved.</p>
          <p>Built to help students take their next step.</p>
        </div>
      </div>
    </footer>
  );
}
