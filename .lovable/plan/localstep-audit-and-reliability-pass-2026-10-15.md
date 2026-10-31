# LocalStep audit and reliability pass

Improve the existing product. No rebuild, no big new features, and database changes only where security needs them.

## Phase 1: Audit and report (no changes yet)
Test the site as a signed-out visitor, a student and an employer, using two test accounts of each type. Then send you a short report that covers:
- **What already works** (checked in the browser).
- **Highest-priority issues**, ranked by severity.
- **Every piece of demo content.** Initial findings:
  - Sample listings with fictional employers.
  - The "Job views 482" and similar numbers on the For Employers page.
  - Match Scores shown on applications, the dashboard and Discover.
- **Security findings.** Initial finding: 5 internal database functions can be run by anyone, including people who aren't signed in. 6 can be run by any signed-in user.

## Phase 2: Fix in priority order
1. **Sign-in and saving.** Test account creation, Google sign-in, and that profile, resume, tasks, saved jobs and applications are still there after a refresh and after signing out and back in. Fix anything that fails.
2. **Security.** Lock down the internal database functions that are open to the public. Confirm a student can't see another student's data and an employer can't see another employer's applicants.
3. **Student workflow.** Check search, filters, job details, save and unsave, apply, the applications list and detail pages, and profile edits. Fix any button or form that doesn't work.
4. **Employer workflow.** Check sign-up, creating and editing a listing, viewing applicants and changing their status. Add editing for listings if it's missing.
5. **Real vs. demo data.** Put a clear "Sample" label on every demo listing and statistic. Employer dashboard numbers will come only from real records. Match Scores will use one shared calculation everywhere, with a short note explaining what the score means.
6. **Homepage messaging.** Rewrite the headline, subheading and buttons. Stay local-first ("jobs and internships near you") and make other opportunity types easy to find through Discover. Layout stays the same.
7. **Quality.** Check phone layouts, loading states, error messages and empty states on the main pages.

## Phase 3: Verify and report
Run type checks and test the real flows in the browser. The final report will separate:
- Fixes that were tested and confirmed.
- Items you still need to test yourself, such as a real Google sign-in with your own account.
- Items that need outside setup, such as the commission rate and billing.

## Technical details
- Security: revoke EXECUTE on SECURITY DEFINER functions (from anon, and from authenticated where not needed). Re-run the linter and the security scan afterwards.
- Match Score: one function in `src/lib/localstep/matching.ts` used by every page that shows a score. Applications keep the score recorded when they were submitted.
- Isolation test: mint sessions for two test users, then check through the UI and direct queries that neither can read the other's rows.
