import type { MetadataRoute } from "next";
import { SITE_URL } from "./data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      // The chooser. Carries the identity block but not the work, so it is
      // not the page a query about the work should land on.
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      // Every role, project and metric in prose. This is the one a search
      // result should point at, so it takes top priority over the chooser
      // that links to it.
      url: `${SITE_URL}/galaxy/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      // The same content as an application. Listed so it is discoverable, at
      // a lower priority than the reading view.
      url: `${SITE_URL}/studio/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
