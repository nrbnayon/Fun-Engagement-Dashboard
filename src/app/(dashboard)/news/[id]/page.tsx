// src/app/(dashboard)/news/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ArrowLeft, Calendar, Edit, Trash2 } from "lucide-react";
import { DashboardHeader } from "../../components/dashboard-header";
import { generateNewsData, News } from "@/lib/data/news";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allNews = generateNewsData(50);
    const foundNews = allNews.find((item) => item.id === params.id);

    setNews(foundNews || null);
    setLoading(false);
  }, [params.id]);

  const handleDelete = () => {
    if (news) {
      // In a real app, you would make an API call to delete the news
      toast.success("News deleted successfully!");
      router.push("/news");
    }
  };

  const handleEdit = () => {
    // In a real app, you would navigate to an edit page or open a modal
    toast.info("Edit functionality would be implemented here");
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader />
        <div className="p-4 md:p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div>
        <DashboardHeader />
        <div className="p-4 md:p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              News Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The news article you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button
              onClick={() => router.push("/news")}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to News
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader />
      <div className='p-4 md:p-8 space-y-6'>
        {/* Header with Back Button */}
        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={() => router.push("/news")}
            className='flex items-center gap-2'
          >
            <ArrowLeft size={16} />
            Back to News
          </Button>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleEdit}
              className='flex items-center gap-2 text-blue-600 hover:text-blue-800'
            >
              <Edit size={16} />
              Edit
            </Button>
            <Button
              variant='outline'
              onClick={() => setDeleteConfirmOpen(true)}
              className='flex items-center gap-2 text-red-600 hover:text-red-800'
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>

        {/* News Content */}
        <Card className='overflow-hidden bg-[#FBFDFF]'>
          <div className='relative px-6 rounded-2xl'>
            <Image
              src={news.image}
              alt={news.title}
              width={1200}
              height={400}
              className='w-full h-64 md:h-96 object-cover rounded-2xl'
            />
          </div>
          <CardContent className='p-6 md:p-8'>
            {/* Date */}
            <div className='flex items-center gap-2 mb-4'>
              <Calendar size={16} className='text-gray-500' />
              <span className='text-sm text-gray-500'>{news.createTime}</span>
            </div>

            {/* Title */}
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
              {news.title}
            </h1>

            {/* Description */}
            <div className='prose max-w-none bg-[#FBFDFF]'>
              <MDEditor.Markdown
                source={news.description}
                style={{
                  whiteSpace: "pre-wrap",
                  backgroundColor: "transparent",
                  color: "black",
                }}
              />
            </div>

            {/* Additional content sections could go here */}
            <div className='mt-8 pt-8 border-t border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Related Articles
              </h3>
              <p className='text-gray-600'>
                Related articles would be displayed here...
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete News</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete `{news.title}`? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setDeleteConfirmOpen(false)}
                className='hover:bg-gray-50'
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
