import { Link } from "@tanstack/react-router";

import { LogoMark } from "./logo";

const columns = [
  {
    heading: "Students",
    links: [
      { to: "/jobs", label: "Find Jobs" },
      { to: "/internships", label: "Find Internships" },
      { to: "/profile", label: "Create Profile" },
      { to: "/saved", label: "Saved Opportunities" },
    ],
  },
  {
    heading: "Employers",
    links: [
      { to: "/employer/jobs/new", label: "Post a Job" },
      { to: "/employer", label: "Employer Dashboard" },
      { to: "/employers", label: "Pricing" },
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
            Your next opportunity is closer than you think.
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
          <p>Listings shown on this site are demonstration data.</p>
        </div>
      </div>
    </footer>
  );
}
