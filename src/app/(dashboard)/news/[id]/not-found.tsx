// src/app/(dashboard)/news/[id]/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileX } from "lucide-react";
import { DashboardHeader } from "../../components/dashboard-header";

export default function NotFound() {
  return (
    <div>
      <DashboardHeader />
      <div className='p-4 md:p-8'>
        <div className='max-w-2xl mx-auto text-center py-16'>
          <FileX size={64} className='mx-auto text-gray-400 mb-6' />

          <h1 className='text-4xl font-bold text-gray-900 mb-4 font-oswald'>
            Article Not Found
          </h1>

          <p className='text-lg text-gray-600 mb-8'>
            The news article you&apos;re looking for doesn&apos;t exist or may
            have been removed.
          </p>

          <div className='flex gap-4 justify-center'>
            <Link href='/news'>
              <Button>
                <ArrowLeft size={16} className='mr-2' />
                Back to News
              </Button>
            </Link>

            <Link href='/overview'>
              <Button variant='outline'>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
