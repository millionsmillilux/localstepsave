# LocalStep — student jobs marketplace MVP

A polished marketplace MVP: a landing page that sells the idea, a real job discovery flow for students, and an employer side with a dashboard and job posting.

## Design system

- Background #FAFAF8, text #172033, secondary #667085, accent #2563EB, accent light #EFF6FF, success #16A34A, borders #E5E7EB — all as semantic tokens in `src/styles.css` (oklch).
- Inter via a `<link>` in the root route. Moderate radii, hairline borders, soft shadows only on raised surfaces, generous whitespace.
- Simple LocalStep mark: a pin whose tail forms a forward step / "L", drawn as inline SVG (no image asset), plus wordmark.
- Sticky header: logo left; Find Jobs / Internships / For Employers center; Sign In + Get Started right; hamburger sheet on mobile.

## Pages

- `/` — hero with headline, two CTAs, trust line, and a browser-chrome product mockup with the three sample cards and the "Designed around your schedule" chips; value bar; problem section (3 cards); how it works (01–03); job discovery preview with working search box, filter chips and demo cards; differentiators; employer section with dashboard preview; pricing (Basic / Featured $15 / Business $30, labeled example MVP pricing); student CTA; four-column footer.
- `/jobs` — filter sidebar (distance, job type, pay, schedule, experience, age, category) with live client-side filtering, search + location + sort, result cards, save toggle. Sidebar becomes a filter drawer on mobile.
- `/jobs/$id` — full detail: header facts, About / What you'll do / What we're looking for / Schedule / Requirements, right rail with employer card, Apply, Save, and a small "Report Opportunity" link.
- `/jobs/$id/apply` — 3 steps (confirm profile → review → submit) then a confirmation screen with View My Applications / Find More Opportunities.
- `/profile` — editable student profile (name, school, grad year, interests, skills, availability, preferred distance, experience, activities) with a completion meter and suggestions; optional resume field, no upload required.
- `/saved` and `/applications` — lists with polished empty states.
- `/internships`, `/employers` (marketing), `/auth` (Student / Employer tabs), `/about`, `/contact`, `/privacy`, `/terms`.
- `/employer` dashboard with sidebar (Dashboard, Jobs, Applicants, Company Profile, Billing), stat cards, active listings; `/employer/jobs/new` with the full form and a live student-facing preview.

## Data & auth

Enable Lovable Cloud and create the schema as specified: `student_profiles`, `employers`, `jobs`, `saved_jobs`, `applications` (roles via a separate `user_roles` table rather than a column on users), with RLS and grants. Seed 10–12 demo jobs for the fictional employers in the migration so the site is alive on first load, each flagged as demo data.

Email/password auth with separate Student and Employer sign-up entry points. Browsing, filtering and job details stay public; profile, saved, applications and the employer area sit behind the auth gate. Saved jobs and applications persist to the database when signed in.

## Technical notes

- TanStack Start file routes; public pages SSR with per-route `head()` metadata; authenticated pages under `_authenticated/`.
- Reads of public job data go through a publishable-key server function; user-scoped reads/writes through authenticated server functions.
- Filtering/sorting is client-side over the fetched listing set — no AI matching, no payments, no messaging.
- Accessibility: semantic landmarks, labeled controls, visible focus rings, keyboard-operable drawers and menus.
- Verify at the end by walking both demo paths (student discovery → apply, employer → post job) in the browser at desktop and mobile widths.

## Not in this build

AI matching, payment processing, messaging, notifications, verification systems, school portals.
