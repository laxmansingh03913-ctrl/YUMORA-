import { MetadataRoute } from "next";
import { SEED_NOVELS, SEED_COMICS } from "@/lib/data/seed-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://youmika.site";
  const currentDate = new Date().toISOString();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/novels`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/comics`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contests`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/creator`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic novel routes
  const novelRoutes: MetadataRoute.Sitemap = SEED_NOVELS.map((novel) => ({
    url: `${baseUrl}/novels/${novel.slug || novel.id}`,
    lastModified: novel.updatedAt || currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic comic routes
  const comicRoutes: MetadataRoute.Sitemap = SEED_COMICS.map((comic) => ({
    url: `${baseUrl}/comics/${comic.slug || comic.id}`,
    lastModified: comic.updatedAt || currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...novelRoutes, ...comicRoutes];
}
