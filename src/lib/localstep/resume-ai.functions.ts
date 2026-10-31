import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  category: z.string().max(40),
  title: z.string().max(160),
  organization: z.string().max(160),
  notes: z.string().min(1).max(2000),
});

/** Rewrites a student's own notes into resume bullets. Never adds facts. */
export const rewriteBullets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI writing help is not available right now.");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You rewrite a high school or college student's own notes into 2-4 concise, professional, ATS-friendly resume bullet points. Rules: start each bullet with a strong past-tense action verb (present tense if clearly ongoing); keep every fact from the notes; NEVER invent accomplishments, numbers, percentages, awards, tools, or outcomes that are not explicitly in the notes; do not add purposes, reasons, skills gained or results (e.g. never append 'to improve communication' or 'ensuring success'); if the notes are vague, stay vague rather than guessing; no first person; no ending periods; max 25 words per bullet. Respond with JSON only: {\"bullets\": [\"...\"]}.",
          },
          {
            role: "user",
            content: `Type: ${data.category}\nRole/title: ${data.title || "(none)"}\nOrganization: ${data.organization || "(none)"}\nStudent's notes:\n${data.notes}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (res.status === 429) throw new Error("Too many requests — try again in a minute.");
    if (res.status === 402) throw new Error("AI writing help is out of credits right now.");
    if (!res.ok) throw new Error("AI writing help failed. Please try again.");
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "";
    const match = content.match(/\{[\s\S]*\}/);
    const parsed = z
      .object({ bullets: z.array(z.string()).min(1).max(6) })
      .safeParse(match ? JSON.parse(match[0]) : null);
    if (!parsed.success) throw new Error("AI returned an unexpected answer. Please try again.");
    return { bullets: parsed.data.bullets.map((b) => b.replace(/^[•\-*\s]+/, "").replace(/\.$/, "").trim()).filter(Boolean) };
  });
