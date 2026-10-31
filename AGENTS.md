<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules

- Public route `head()` uses `seoHead()` from `src/lib/seo.ts` — one place builds title, description, OG/Twitter, canonical and noindex, and holds the public origin.
- Every route sets `staticData.sitemap`; `/sitemap.xml` is derived from the router (`src/lib/sitemap.ts`) — new public pages appear automatically, private subtrees stay excluded.
- Resume preview, PDF and DOCX all render from `buildResumeDoc()` in `src/lib/localstep/resume-doc.ts` — keeps the three outputs identical; wizard fields live inside the existing `student_resumes.resume` JSON (no extra tables).
