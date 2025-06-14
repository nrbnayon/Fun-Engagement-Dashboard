import { MetadataRoute } from "next";
import { generateMatchesData } from "@/lib/data/matches";
import { generateNewsData } from "@/lib/data/news";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://your-domain.com"; // Update with your domain

  // Generate dynamic routes for matches and news
  const matches = generateMatchesData(10);
  const news = generateNewsData(10);

  const matchUrls = matches.map((_, index) => ({
    url: `${baseUrl}/matches/${index + 1}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const newsUrls = news.map((article) => ({
    url: `${baseUrl}/news/${article.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/matches`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/players-list`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fan-ranking`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...matchUrls,
    ...newsUrls,
  ];
}
