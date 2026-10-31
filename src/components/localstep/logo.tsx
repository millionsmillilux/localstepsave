import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-6 w-6", className)}>
      <path
        d="M12 2.75c-3.45 0-6.25 2.72-6.25 6.08 0 4.29 5.2 10.16 5.42 10.4a1.12 1.12 0 0 0 1.66 0c.22-.24 5.42-6.11 5.42-10.4 0-3.36-2.8-6.08-6.25-6.08Z"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        d="M12 2.75c-3.45 0-6.25 2.72-6.25 6.08 0 4.29 5.2 10.16 5.42 10.4a1.12 1.12 0 0 0 1.66 0c.22-.24 5.42-6.11 5.42-10.4 0-3.36-2.8-6.08-6.25-6.08Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M10.1 6.2v4.6h3.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15.6 21.25H8.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-ink transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="LocalStep home"
    >
      <LogoMark className="h-6 w-6 text-primary" />
      <span className="text-[1.0625rem] font-semibold tracking-tight">LocalStep</span>
    </Link>
  );
}
