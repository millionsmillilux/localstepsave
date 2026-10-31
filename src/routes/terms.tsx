import { createFileRoute } from "@tanstack/react-router";

import { Container, SectionHeading, SitePage } from "@/components/localstep/page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | LocalStep" },
      { name: "description", content: "The terms that apply to students and employers using LocalStep." },
      { property: "og:title", content: "Terms of Service | LocalStep" },
      { property: "og:description", content: "The terms that apply to students and employers using LocalStep." },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "Using LocalStep",
    body: "LocalStep connects students with local employers. Students are free to browse, save, and apply to listings. Employers are responsible for the accuracy of every listing they publish.",
  },
  {
    title: "Employer responsibilities",
    body: "Employers must comply with applicable labour laws, including minimum age, work permit, and hour restrictions for minors. Listings must describe real roles with accurate pay and schedule information.",
  },
  {
    title: "Student responsibilities",
    body: "Provide truthful profile information and only apply to roles you intend to consider. Never share sensitive personal or financial information with an employer through LocalStep.",
  },
  {
    title: "Content and conduct",
    body: "We may remove listings or accounts that are misleading, unsafe, discriminatory, or otherwise inappropriate for a student audience. You can report any listing from its job detail page.",
  },
  {
    title: "No guarantee",
    body: "LocalStep does not guarantee employment, applicant quality, or the outcome of any application. We are not a party to any agreement between a student and an employer.",
  },
  {
    title: "Prototype notice",
    body: "LocalStep is an early product. Employers post for free and pay a fee only for successful hires; billing is not yet active. Features, pricing, and terms may change.",
  },
];

function TermsPage() {
  return (
    <SitePage>
      <Container className="max-w-3xl py-16">
        <SectionHeading eyebrow="Legal" title="Terms of Service" description="Last updated: January 2026" />
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-ink">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </SitePage>
  );
}
