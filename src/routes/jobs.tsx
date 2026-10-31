import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/jobs")({
  staticData: { sitemap: false },
  component: () => <Outlet />,
});
