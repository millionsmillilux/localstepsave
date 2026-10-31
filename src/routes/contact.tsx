import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { useState } from "react";
import { toast } from "sonner";

import { Container, SectionHeading, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({ ...seoHead({ path: "/contact", title: "Contact LocalStep", description: "Questions about LocalStep for students, schools or employers? Send the LocalStep team a message." }) }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SitePage>
      <Container className="max-w-xl py-16">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch"
          description="Students, schools and local employers are all welcome to reach out."
        />

        {sent ? (
          <div className="mt-10 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-base font-semibold text-ink">Thanks — message received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This is a prototype, so nothing is actually sent yet. We'll wire up real email delivery soon.
            </p>
            <Button className="mt-5" variant="outline" onClick={() => setSent(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form
            className="mt-10 space-y-4 rounded-xl border border-border bg-surface p-6"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
              toast.success("Message sent");
            }}
          >
            <div>
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="contact-message">Message</Label>
              <Textarea id="contact-message" rows={5} required className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full">
              Send message
            </Button>
          </form>
        )}
      </Container>
    </SitePage>
  );
}
