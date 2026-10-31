import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Container, SitePage } from "@/components/localstep/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { profileCompletion, useLocalStep } from "@/lib/localstep/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student profile | LocalStep" },
      {
        name: "description",
        content: "Build a student profile that shows your interests, skills and availability — no resume required.",
      },
      { property: "og:title", content: "Student profile | LocalStep" },
      { property: "og:description", content: "No resume required. Show what you're interested in and when you're free." },
    ],
  }),
  component: ProfilePage,
});

const interestOptions = ["Marketing", "Design", "Technology", "Food & Beverage", "Community", "Sports", "Retail", "Office"];
const skillOptions = ["Customer service", "Canva", "Coding", "Photography", "Spanish", "Cash handling", "Tutoring", "Teamwork"];
const availabilityOptions = ["After school", "Weekends", "Summer", "Evenings", "Flexible"];

function ChipPicker({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary/40 bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ProfilePage() {
  const { profile, updateProfile, hydrated } = useLocalStep();
  const { percent, suggestions } = profileCompletion(profile);

  function toggleIn(key: "interests" | "skills" | "availability", value: string) {
    const current = profile[key];
    updateProfile({ [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  }

  return (
    <SitePage>
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Your student profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You don't need work experience to have a strong profile. School, clubs and interests all count.
            </p>

            <form
              className="mt-8 space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                toast.success("Profile saved");
              }}
            >
              <section className="rounded-xl border border-border bg-surface p-6">
                <h2 className="text-base font-semibold text-ink">Basics</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="profile-name">Name</Label>
                    <Input
                      id="profile-name"
                      className="mt-1.5"
                      value={profile.name}
                      onChange={(event) => updateProfile({ name: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-school">School</Label>
                    <Input
                      id="profile-school"
                      className="mt-1.5"
                      value={profile.school}
                      onChange={(event) => updateProfile({ school: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-age">Age</Label>
                    <Input
                      id="profile-age"
                      className="mt-1.5"
                      type="number"
                      min={13}
                      max={25}
                      value={profile.age ?? ""}
                      onChange={(event) =>
                        updateProfile({ age: event.target.value === "" ? null : Number(event.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-grad">Graduation year</Label>
                    <Input
                      id="profile-grad"
                      className="mt-1.5"
                      inputMode="numeric"
                      value={profile.graduationYear}
                      onChange={(event) => updateProfile({ graduationYear: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-location">Preferred location</Label>
                    <Input
                      id="profile-location"
                      className="mt-1.5"
                      value={profile.preferredLocation ?? ""}
                      onChange={(event) => updateProfile({ preferredLocation: event.target.value })}
                      placeholder="Barrington, IL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-distance">Preferred distance ({profile.preferredDistance} mi)</Label>
                    <Input
                      id="profile-distance"
                      type="range"
                      min={1}
                      max={25}
                      className="mt-3 h-2 cursor-pointer appearance-none rounded-full bg-secondary p-0 accent-primary"
                      value={profile.preferredDistance}
                      onChange={(event) => updateProfile({ preferredDistance: Number(event.target.value) })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="profile-bio">About you</Label>
                  <Textarea
                    id="profile-bio"
                    rows={3}
                    className="mt-1.5"
                    value={profile.bio}
                    onChange={(event) => updateProfile({ bio: event.target.value })}
                    placeholder="A couple of sentences about what you're looking for."
                  />
                </div>
              </section>

              <section className="space-y-6 rounded-xl border border-border bg-surface p-6">
                <h2 className="text-base font-semibold text-ink">Interests, skills and availability</h2>
                <ChipPicker
                  legend="Interests"
                  options={interestOptions}
                  selected={profile.interests}
                  onToggle={(value) => toggleIn("interests", value)}
                />
                <ChipPicker
                  legend="Skills"
                  options={skillOptions}
                  selected={profile.skills}
                  onToggle={(value) => toggleIn("skills", value)}
                />
                <ChipPicker
                  legend="Availability"
                  options={availabilityOptions}
                  selected={profile.availability}
                  onToggle={(value) => toggleIn("availability", value)}
                />
              </section>

              <section className="space-y-4 rounded-xl border border-border bg-surface p-6">
                <h2 className="text-base font-semibold text-ink">Experience and activities</h2>
                <div>
                  <Label htmlFor="profile-experience">Experience</Label>
                  <Textarea
                    id="profile-experience"
                    rows={3}
                    className="mt-1.5"
                    value={profile.experience}
                    onChange={(event) => updateProfile({ experience: event.target.value })}
                    placeholder="Babysitting, volunteering, a school project — anything counts."
                  />
                </div>
                <div>
                  <Label htmlFor="profile-activities">Extracurricular activities</Label>
                  <Textarea
                    id="profile-activities"
                    rows={2}
                    className="mt-1.5"
                    value={profile.activities}
                    onChange={(event) => updateProfile({ activities: event.target.value })}
                    placeholder="Clubs, sports, music, student government."
                  />
                </div>
                <div>
                  <Label htmlFor="profile-resume">Add Resume (optional)</Label>
                  <Input
                    id="profile-resume"
                    className="mt-1.5"
                    value={profile.resumeNote}
                    onChange={(event) => updateProfile({ resumeNote: event.target.value })}
                    placeholder="Paste a link, or leave this blank — a resume is never required."
                  />
                </div>
              </section>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">Save profile</Button>
                <Button asChild variant="outline" type="button">
                  <Link to="/jobs">Find Opportunities</Link>
                </Button>
              </div>
            </form>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">Profile {hydrated ? percent : 0}% complete</h2>
              <Progress value={hydrated ? percent : 0} className="mt-3" />
              {suggestions.length > 0 ? (
                <>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Recommended next
                  </p>
                  <ul className="mt-2 space-y-2">
                    {suggestions.slice(0, 4).map((suggestion) => (
                      <li key={suggestion} className="text-sm text-muted-foreground">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Your profile is complete. Nice work.</p>
              )}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {profile.interests.slice(0, 4).map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </SitePage>
  );
}
