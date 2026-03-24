import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const routes = [
    "",
    "/discover",
    "/contact",
    "/market-prices",
    "/advisor",
    "/tools/sell",
    "/tools/zakat",
    "/size-guide",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  const localizedRoutes = routes.flatMap((route) => ([
    {
      url: `${baseUrl}${route}`,
      lastModified: now,
      alternates: {
        languages: {
          en: `${baseUrl}${route}`,
          ar: `${baseUrl}${route}`,
        },
      },
    },
  ]));

  return localizedRoutes;
}

