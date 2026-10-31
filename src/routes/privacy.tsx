import { createFileRoute } from "@tanstack/react-router";

import { Container, SectionHeading, SitePage } from "@/components/localstep/page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | LocalStep" },
      { name: "description", content: "How LocalStep handles student and employer information." },
      { property: "og:title", content: "Privacy Policy | LocalStep" },
      { property: "og:description", content: "How LocalStep handles student and employer information." },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "Information we collect",
    body: "We collect the information you enter into your profile or job listing: name, school, graduation year, interests, availability, and contact email. We do not ask students for addresses, phone numbers, or government identification.",
  },
  {
    title: "How we use it",
    body: "Student information is used to show relevant local opportunities and to send an application to an employer when you choose to apply. Employer information is used to display job listings to students.",
  },
  {
    title: "What we share",
    body: "When you apply to a job, the employer sees your name, school, graduation year, and the note you wrote. Nothing else in your profile is shared automatically, and we never sell personal information.",
  },
  {
    title: "Students under 18",
    body: "LocalStep is designed for teen and young adult workers. We intentionally minimise the personal data collected from minors and encourage students to review listings with a parent or guardian.",
  },
  {
    title: "Prototype notice",
    body: "In this early version, profile, saved job, and application data is stored in your browser on this device only.",
  },
];

function PrivacyPage() {
  return (
    <SitePage>
      <Container className="max-w-3xl py-16">
        <SectionHeading eyebrow="Legal" title="Privacy Policy" description="Last updated: January 2026" />
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
