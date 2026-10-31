import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { List, Map, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { JobCard } from "@/components/localstep/job-card";
import { OpportunityMap } from "@/components/localstep/opportunity-map";
import { Container, EmptyState, SitePage } from "@/components/localstep/page";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { categories, employmentTypes, experienceLevels, schedules } from "@/lib/localstep/jobs";
import { getOpportunityMatch, profileHasData } from "@/lib/localstep/matching";
import { useLocalStep } from "@/lib/localstep/store";
import type { Job, StudentProfile } from "@/lib/localstep/types";
import { getOpportunityDistance } from "@/lib/localstep/geo";

export const Route = createFileRoute("/jobs/")({
  staticData: { sitemap: true },
  head: () => ({
    ...seoHead({
      path: "/jobs",
      title: "Local Student Jobs & Part-Time Work | LocalStep",
      description:
        "Search local part-time jobs, internships and volunteer roles for students on LocalStep. Filter by distance, schedule, pay, age and experience.",
    }),
  }),
  component: JobsPage,
});

interface Filters {
  distance: number;
  types: string[];
  minPay: number;
  schedules: string[];
  experience: string[];
  maxAge: number;
  categories: string[];
}

const defaultFilters: Filters = {
  distance: 10,
  types: [],
  minPay: 0,
  schedules: [],
  experience: [],
  maxAge: 18,
  categories: [],
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function CheckboxGroup({
  legend,
  options,
  selected,
  onToggle,
  idPrefix,
}: {
  legend: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  idPrefix: string;
}) {
  return (
    <fieldset className="border-t border-border pt-5">
      <legend className="mb-3 text-sm font-semibold text-ink">{legend}</legend>
      <div className="space-y-2.5">
        {options.map((option) => {
          const id = `${idPrefix}-${option.replace(/\W+/g, "-").toLowerCase()}`;
          return (
            <div key={option} className="flex items-center gap-2.5">
              <Checkbox
                id={id}
                checked={selected.includes(option)}
                onCheckedChange={() => onToggle(option)}
              />
              <Label htmlFor={id} className="text-sm font-normal text-muted-foreground">
                {option}
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function FilterPanel({
  filters,
  setFilters,
  idPrefix,
}: {
  filters: Filters;
  setFilters: (next: Filters) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Filters</h2>
        <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)}>
          Reset
        </Button>
      </div>

      <div className="border-t border-border pt-5">
        <Label htmlFor={`${idPrefix}-distance`} className="text-sm font-semibold text-ink">
          Distance
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">Within {filters.distance} miles</p>
        <Slider
          id={`${idPrefix}-distance`}
          className="mt-3"
          min={1}
          max={25}
          step={1}
          value={[filters.distance]}
          onValueChange={([value]) => setFilters({ ...filters, distance: value ?? 10 })}
        />
      </div>

      <CheckboxGroup
        legend="Job type"
        idPrefix={`${idPrefix}-type`}
        options={employmentTypes}
        selected={filters.types}
        onToggle={(value) => setFilters({ ...filters, types: toggle(filters.types, value) })}
      />

      <div className="border-t border-border pt-5">
        <Label htmlFor={`${idPrefix}-pay`} className="text-sm font-semibold text-ink">
          Pay
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">
          {filters.minPay === 0 ? "Any pay, including volunteer" : `$${filters.minPay}/hr and up`}
        </p>
        <Slider
          id={`${idPrefix}-pay`}
          className="mt-3"
          min={0}
          max={22}
          step={1}
          value={[filters.minPay]}
          onValueChange={([value]) => setFilters({ ...filters, minPay: value ?? 0 })}
        />
      </div>

      <CheckboxGroup
        legend="Schedule"
        idPrefix={`${idPrefix}-schedule`}
        options={schedules}
        selected={filters.schedules}
        onToggle={(value) =>
          setFilters({ ...filters, schedules: toggle(filters.schedules, value) })
        }
      />

      <CheckboxGroup
        legend="Experience"
        idPrefix={`${idPrefix}-exp`}
        options={experienceLevels}
        selected={filters.experience}
        onToggle={(value) =>
          setFilters({ ...filters, experience: toggle(filters.experience, value) })
        }
      />

      <div className="border-t border-border pt-5">
        <Label htmlFor={`${idPrefix}-age`} className="text-sm font-semibold text-ink">
          Age requirement
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">Open to age {filters.maxAge} and under</p>
        <Slider
          id={`${idPrefix}-age`}
          className="mt-3"
          min={14}
          max={18}
          step={1}
          value={[filters.maxAge]}
          onValueChange={([value]) => setFilters({ ...filters, maxAge: value ?? 18 })}
        />
      </div>

      <CheckboxGroup
        legend="Category"
        idPrefix={`${idPrefix}-cat`}
        options={categories}
        selected={filters.categories}
        onToggle={(value) =>
          setFilters({ ...filters, categories: toggle(filters.categories, value) })
        }
      />
    </div>
  );
}

function matches(
  job: Job,
  filters: Filters,
  query: string,
  location: string,
  profile: StudentProfile,
) {
  const q = query.trim().toLowerCase();
  if (q && !`${job.title} ${job.employer} ${job.category} ${job.summary}`.toLowerCase().includes(q))
    return false;
  const loc = location.trim().toLowerCase();
  if (loc && !job.location.toLowerCase().includes(loc)) return false;
  const distance = getOpportunityDistance(profile, job);
  if (distance !== null && distance > filters.distance) return false;
  if (filters.types.length && !filters.types.includes(job.employmentType)) return false;
  if (filters.minPay > 0 && (job.payMin ?? 0) < filters.minPay) return false;
  if (filters.schedules.length && !filters.schedules.includes(job.schedule)) return false;
  if (filters.experience.length && !filters.experience.includes(job.experience)) return false;
  if (job.minimumAge > filters.maxAge) return false;
  if (filters.categories.length && !filters.categories.includes(job.category)) return false;
  return true;
}

function JobsPage() {
  const { allJobs, profile } = useLocalStep();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState("distance");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const profileReady = profileHasData(profile);
  const sortOptions = profileReady
    ? ["best-match", "distance", "newest", "pay", "deadline"]
    : ["distance", "newest", "pay", "deadline"];
  const selectedSort = sortOptions.includes(sort) ? sort : profileReady ? "best-match" : "distance";
  const searchProfile = location.trim()
    ? { ...profile, preferredLocation: location.trim() }
    : profile;

  const results = useMemo(() => {
    const filtered = allJobs.filter(
      (job) =>
        job.active !== false &&
        (!job.moderationStatus || job.moderationStatus === "active") &&
        matches(job, filters, query, location, searchProfile),
    );
    const sorted = [...filtered];
    if (sort === "best-match")
      sorted.sort(
        (a, b) =>
          (getOpportunityMatch(profile, b)?.score ?? 0) -
          (getOpportunityMatch(profile, a)?.score ?? 0),
      );
    if (sort === "distance")
      sorted.sort(
        (a, b) =>
          (getOpportunityDistance(searchProfile, a) ?? Number.POSITIVE_INFINITY) -
          (getOpportunityDistance(searchProfile, b) ?? Number.POSITIVE_INFINITY),
      );
    if (sort === "pay") sorted.sort((a, b) => (b.payMax ?? 0) - (a.payMax ?? 0));
    if (sort === "newest") sorted.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    if (sort === "deadline") sorted.sort((a, b) => (a.postedDaysAgo ?? 0) - (b.postedDaysAgo ?? 0));
    return sorted;
  }, [allJobs, filters, query, location, profile, searchProfile, sort]);

  const activeCount =
    filters.types.length +
    filters.schedules.length +
    filters.experience.length +
    filters.categories.length +
    (filters.minPay > 0 ? 1 : 0) +
    (filters.distance !== defaultFilters.distance ? 1 : 0) +
    (filters.maxAge !== defaultFilters.maxAge ? 1 : 0);

  return (
    <SitePage>
      <div className="border-b border-border bg-surface">
        <Container className="py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Find opportunities near you
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore live jobs, internships, volunteering, scholarships, college programs, and
            competitions built around student schedules.
          </p>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-surface p-5">
              <FilterPanel filters={filters} setFilters={setFilters} idPrefix="desktop" />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                <div>
                  <Label htmlFor="jobs-search" className="sr-only">
                    Job title, skill, or keyword
                  </Label>
                  <Input
                    id="jobs-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Job title, skill, or keyword"
                  />
                </div>
                <div>
                  <Label htmlFor="jobs-location" className="sr-only">
                    ZIP code or city
                  </Label>
                  <Input
                    id="jobs-location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder={
                      profile.preferredLocation
                        ? `Near ${profile.preferredLocation}`
                        : "Near me / ZIP code or city"
                    }
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">
                    {results.length} {results.length === 1 ? "opportunity" : "opportunities"}
                  </p>
                  {!profileReady ? (
                    <p className="text-xs text-muted-foreground">
                      Create a profile to unlock personalized matches and a Best Match sort.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div
                    className="flex rounded-lg border border-border p-0.5"
                    aria-label="Opportunity view"
                  >
                    <Button
                      type="button"
                      variant={view === "list" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setView("list")}
                      aria-pressed={view === "list"}
                    >
                      <List className="mr-1.5 h-4 w-4" /> List View
                    </Button>
                    <Button
                      type="button"
                      variant={view === "map" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setView("map")}
                      aria-pressed={view === "map"}
                    >
                      <Map className="mr-1.5 h-4 w-4" /> Map View
                    </Button>
                  </div>
                  <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button variant="outline" size="sm">
                        <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                        Filters{activeCount ? ` (${activeCount})` : ""}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="text-left">Filters</SheetTitle>
                      </SheetHeader>
                      <div className="px-4 pb-8">
                        <FilterPanel filters={filters} setFilters={setFilters} idPrefix="mobile" />
                        <Button className="mt-6 w-full" onClick={() => setDrawerOpen(false)}>
                          Show {results.length} results
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Label htmlFor="jobs-sort" className="sr-only">
                    Sort results
                  </Label>
                  <Select value={selectedSort} onValueChange={setSort}>
                    <SelectTrigger id="jobs-sort" className="w-[170px]">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      {profileReady ? <SelectItem value="best-match">Best Match</SelectItem> : null}
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="pay">Pay</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="jobs-radius" className="sr-only">
                    Search radius
                  </Label>
                  <Select
                    value={String(filters.distance)}
                    onValueChange={(value) => setFilters({ ...filters, distance: Number(value) })}
                  >
                    <SelectTrigger id="jobs-radius" className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 5, 10, 25].map((radius) => (
                        <SelectItem key={radius} value={String(radius)}>
                          {radius} mile{radius === 1 ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {view === "map" ? (
              <div className="mt-6">
                <OpportunityMap jobs={results.filter((job) => job.active !== false)} />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {results.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {results.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={<X className="mx-auto h-6 w-6" />}
                  title="No opportunities match your filters"
                  description="Try widening the distance, clearing a filter, or searching for a different keyword."
                  action={
                    <Button
                      onClick={() => {
                        setFilters(defaultFilters);
                        setQuery("");
                        setLocation("");
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </SitePage>
  );
}
