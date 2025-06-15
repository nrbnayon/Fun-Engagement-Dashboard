// src/app/(dashboard)/news/[id]/layout.tsx
import { Metadata } from "next";
import { generateNewsData } from "@/lib/data/news";
import { generateArticleSchema, siteConfig } from "@/lib/seo/metadata";

interface NewsDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for individual news articles
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  // Await the params
  const { id } = await params;

  const newsData = generateNewsData(50);
  const article = newsData.find((news) => news.id === id);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const description =
    article.description.length > 160
      ? article.description.substring(0, 160) + "..."
      : article.description;

  return {
    title: article.title,
    description: description,
    keywords: [
      "football news",
      "sports news",
      article.title.split(" ").slice(0, 5).join(" "),
      "fan engagement",
    ],
    openGraph: {
      title: article.title,
      description: description,
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: new Date(article.createTime).toISOString(),
      authors: [siteConfig.author],
      section: "Sports",
      tags: ["football", "sports", "news"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: description,
      images: [article.image],
    },
    alternates: {
      canonical: `${siteConfig.url}/news/${id}`,
    },
    other: {
      "article:author": siteConfig.author,
      "article:section": "Sports",
      "article:published_time": new Date(article.createTime).toISOString(),
    },
  };
}

// Generate static params for static generation (optional)
export async function generateStaticParams() {
  const newsData = generateNewsData(50);

  return newsData.slice(0, 10).map((news) => ({
    id: news.id,
  }));
}

export default async function NewsDetailLayout({
  children,
  params,
}: NewsDetailLayoutProps) {
  // Await the params
  const { id } = await params;

  // Get article data for JSON-LD
  const newsData = generateNewsData(50);
  const article = newsData.find((news) => news.id === id);

  return (
    <>
      {/* JSON-LD Structured Data */}
      {article && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateArticleSchema(article)),
          }}
        />
      )}
      {children}
    </>
  );
}
