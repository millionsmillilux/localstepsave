# Finish sign-in and saved data, rebrand to LocalStep, pay-per-hire pricing

## Already done
- Set up the real database for profiles, resumes, saved opportunities, applications, tasks, deadlines, activities, achievements, business profiles and posted opportunities. Each user can only see and change their own records.
- Turned on Google sign-in and email/password sign-in.
- Rewrote the sign-in page: Google now works through the built-in sign-in helper, the Student/Employer choice is remembered on first sign-in only, email sign-up shows a "check your email" screen, and buttons show a loading state.
- Failed saves now show an error message instead of failing silently.

## Remaining: sign-in and saved data
1. Fix the two remaining type errors in the data layer so the app builds.
2. Sign-out: clear cached data and return to the sign-in page.
3. Protect student pages (dashboard, profile, saved, applications, my steps, resume) and employer pages so signed-out visitors are sent to sign in.
4. Header shows the signed-in account with a sign-out option instead of a static "Sign In".
5. Test in the browser: sign up, edit profile, add a task and activity, save an opportunity, refresh, sign out and back in, and confirm a second account cannot see the first account's data.

## New: LocalStep branding
- Replace every "Steply" with "LocalStep": logo wordmark, header, footer, page titles and descriptions, sign-in page, About, Privacy, Terms.
- Update the outdated "stored in your browser" notice on Privacy and the "fictional listings" note on Terms to reflect that accounts are now saved securely.

## New: pay-per-successful-hire pricing
- Replace the Basic / Featured / Business tiers on the For Employers page and landing page with one model: posting is free, and the employer pays a commission only when a student is hired through LocalStep.
- Show a short "How it works": post free, review applicants, mark a student as hired, pay the hire fee.
- Employer dashboard: when an employer moves an application to "Accepted", show a note that this counts as a successful hire and the fee applies.
- No real payments are processed yet; the page will say billing is coming soon.
- The commission amount is shown as a placeholder (for example "a one-time fee per hire") until you give me the exact rate or amount.

## Technical details
- Rebrand is a text sweep across routes and components (no route or file renames).
- Pricing copy stored as a single constant so the rate is easy to change later.
- Protected pages move under the managed signed-in layout; sign-in redirect returns users to the right dashboard.
- Save the LocalStep brand name and commission pricing model as project memory.
- Apply the pending routine package security update at the end.
