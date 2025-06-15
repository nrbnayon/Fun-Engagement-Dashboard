// src/lib/data/news.ts
export interface News {
  id: string;
  image: string;
  title: string;
  description: string;
  createTime: string;
}

// Sample news data
const sampleNews = [
  {
    title: "Real Madrid begin preparations for real sociedad clash",
    description:
      "Real Madrid have started their preparations for the upcoming match against Real Sociedad. The team is focused on maintaining their winning streak and securing another victory in La Liga. Coach Carlo Ancelotti has been working with the squad on tactical improvements and fitness levels.",
    image: "/news.png",
  },
  {
    title: "Barcelona signs new midfielder for €50 million",
    description:
      "FC Barcelona has completed the signing of a new midfielder in a deal worth €50 million. The player is expected to strengthen the team's midfield and bring creativity to their gameplay. The official announcement was made during a press conference.",
    image: "/news.png",
  },
  {
    title: "Champions League draw results announced",
    description:
      "The Champions League draw has been completed with some exciting matchups ahead. Several top European clubs will face each other in what promises to be thrilling encounters. The first leg matches are scheduled for next month.",
    image: "/news.png",
  },
  {
    title: "Transfer window updates and rumors",
    description:
      "The latest transfer window has seen several high-profile moves across European football. Many clubs are still active in the market looking for reinforcements. Here's a comprehensive update on all the major transfers and rumors.",
    image: "/news.png",
  },
  {
    title: "World Cup qualifiers schedule released",
    description:
      "FIFA has released the official schedule for the upcoming World Cup qualifiers. National teams will compete for the remaining spots in the tournament. The matches are expected to be highly competitive with several strong teams vying for qualification.",
    image: "/news.png",
  },
];

// Generate sample dates (recent dates)
const generateRecentDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const generateNewsData = (count: number): News[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `news-${index + 1}`,
    image: sampleNews[index % sampleNews.length].image,
    title: sampleNews[index % sampleNews.length].title,
    description: sampleNews[index % sampleNews.length].description,
    createTime: generateRecentDate(Math.floor(Math.random() * 30)), // Random date within last 30 days
  }));
};
