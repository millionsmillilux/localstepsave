/** Public site origin used for canonical URLs, og:url, structured data and the sitemap. */
export const SITE_URL = "https://localstep-student-path.lovable.app";
export const SITE_NAME = "LocalStep";

interface PageSeo {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  noindex?: boolean;
}

/** Per-page head tags: title, description, Open Graph/Twitter and a self-referencing canonical. */
export function seoHead({ path, title, description, type = "website", noindex }: PageSeo) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: type },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
    ],
    links: noindex ? [] : [{ rel: "canonical", href: url }],
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["Local Step", "LocalStep Jobs"],
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/logo.png`,
      description:
        "LocalStep is a local jobs and internship marketplace for high school and college students.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: "Local Step",
      url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};
