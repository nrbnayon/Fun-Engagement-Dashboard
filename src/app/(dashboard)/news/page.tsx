// src/app/(dashboard)/news/page.tsx
import { Metadata } from "next";
import { DashboardHeader } from "../components/dashboard-header";
import NewsListPage from "../components/NewsListPage";
import { generateNewsMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateNewsMetadata();

export default function NewsPage() {
  return (
    <div>
      <DashboardHeader />
      <div className='p-4 md:p-8 space-y-6'>
        <NewsListPage itemsPerPage={12} />
      </div>
    </div>
  );
}
