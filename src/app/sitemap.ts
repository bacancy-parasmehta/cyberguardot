import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getAppUrl(),
      changeFrequency: "weekly",
      priority: 0.1,
    },
  ];
}