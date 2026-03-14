import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}