import { describe, expect, it } from "vitest";
import { buildResumeDoc, tidyBullet } from "../resume-doc";
import { buildResumePdf } from "../resume-export";
import type { StudentResume } from "../types";

const base: StudentResume = {
  template: "classic", summary: "", skills: [], experience: "", projects: "", activities: "",
  volunteerExperience: "", awards: "", availability: "", shareWithApplications: true, updatedAt: "",
};

describe("resume rules", () => {
  it("offline rewording never adds digits", () => {
    expect(tidyBullet("i helped run the bake sale")).not.toMatch(/\d/);
    expect(tidyBullet("i helped run the bake sale")).toBe("Helped run the bake sale");
  });
  it("students with no paid work get no Experience section, but activities appear", () => {
    const doc = buildResumeDoc({ ...base, entries: [
      { id: "1", category: "Scouts", title: "Patrol Leader", organization: "Troop 12", dates: "", bullets: ["Led weekly meetings"] },
      { id: "2", category: "School project", title: "Science fair", organization: "", dates: "", bullets: ["Built a water filter"] },
    ] });
    const titles = doc.sections.map((s) => s.title);
    expect(titles).not.toContain("Experience");
    expect(titles).toEqual(["Projects", "Leadership & Activities"]);
  });
  it("a long resume breaks onto a second US Letter page", async () => {
    const entries = Array.from({ length: 25 }, (_, i) => ({
      id: String(i), category: "Volunteering" as const, title: `Volunteer ${i}`, organization: "Food Bank", dates: "2024",
      bullets: ["Sorted donated food and stocked shelves for weekend distribution with other volunteers from my school", "Greeted families"],
    }));
    const blob = await buildResumePdf(buildResumeDoc({ ...base, entries }), "modern");
    const text = Buffer.from(await blob.arrayBuffer()).toString("latin1");
    expect(text).toMatch(/\/MediaBox \[0 0 612\.?0* 792\.?0*\]/);
    expect(Number(text.match(/\/Count (\d+)/)?.[1])).toBeGreaterThan(1);
  });
});
