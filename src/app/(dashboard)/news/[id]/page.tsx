// src/app/(dashboard)/news/[id]/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ArrowLeft, Calendar, Edit, Trash2, Upload, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data for editing
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    const allNews = generateNewsData(50);
    const foundNews = allNews.find((item) => item.id === params.id);

    setNews(foundNews || null);
    setLoading(false);

    // Initialize form data if news is found
    if (foundNews) {
      setFormData({
        title: foundNews.title,
        description: foundNews.description,
        image: foundNews.image,
      });
    }
  }, [params.id]);

  const handleDelete = () => {
    if (news) {
      // In a real app, you would make an API call to delete the news
      toast.success("News deleted successfully!");
      router.push("/news");
    }
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          image: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({
            ...prev,
            image: e.target?.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // In a real app, you would make an API call to update the news
    if (news) {
      const updatedNews = {
        ...news,
        title: formData.title,
        description: formData.description,
        image: formData.image,
      };
      setNews(updatedNews);
      toast.success("News updated successfully!");
      setIsEditOpen(false);
    }
  };

  const resetForm = () => {
    if (news) {
      setFormData({
        title: news.title,
        description: news.description,
        image: news.image,
      });
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader />
        <div className='p-4 md:p-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='h-64 bg-gray-200 rounded mb-6'></div>
            <div className='h-6 bg-gray-200 rounded w-3/4 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-2/3'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div>
        <DashboardHeader />
        <div className='p-4 md:p-8'>
          <div className='text-center py-12'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              News Not Found
            </h1>
            <p className='text-gray-600 mb-6'>
              The news article you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button
              onClick={() => router.push("/news")}
              className='bg-primary hover:bg-primary/90'
            >
              <ArrowLeft size={16} className='mr-2' />
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

        {/* Edit News Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent
            className='sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0'
            showCloseButton={false}
          >
            <DialogHeader className='bg-primary p-4 flex flex-row items-center justify-between'>
              <DialogTitle className='text-[#141b34] text-xl'>
                Edit News
              </DialogTitle>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 hover:bg-primary-light rounded-full border-2 border-red-500'
                onClick={() => {
                  setIsEditOpen(false);
                  resetForm();
                }}
              >
                <X className='h-5 w-5 text-red-500' />
              </Button>
            </DialogHeader>
            <div className='p-6 space-y-4 pt-0'>
              {/* Image Upload */}
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>News Image</label>
                <div
                  className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors'
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.image ? (
                    <div className='relative'>
                      <Image
                        src={formData.image}
                        alt='Preview'
                        width={200}
                        height={120}
                        className='mx-auto rounded-lg object-cover'
                      />
                      <Button
                        variant='ghost'
                        size='icon'
                        className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white'
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, image: "" }));
                        }}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <Upload className='mx-auto h-12 w-12 text-gray-400' />
                      <div>
                        <p className='text-lg font-medium text-gray-700'>
                          Upload
                        </p>
                        <p className='text-sm text-gray-500'>
                          Drag and drop an image or click to browse
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                  />
                </div>
              </div>

              {/* Title */}
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>
                  Title <span className='text-red-500'>*</span>
                </label>
                <Input
                  placeholder='Enter news title'
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className='text-base'
                />
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>
                  Description <span className='text-red-500'>*</span>
                </label>
                <div className='border border-gray-300 rounded-lg overflow-hidden'>
                  <MDEditor
                    value={formData.description}
                    onChange={(value) =>
                      handleInputChange("description", value || "")
                    }
                    preview='edit'
                    hideToolbar={false}
                    visibleDragbar={false}
                    data-color-mode='light'
                    textareaProps={{
                      placeholder:
                        "Enter news description with markdown support...",
                      style: {
                        fontSize: 14,
                        lineHeight: 1.5,
                        fontFamily:
                          'ui-monospace,SFMono-Regular,"SF Mono",Consolas,"Liberation Mono",Menlo,monospace',
                      },
                    }}
                    height={200}
                  />
                </div>
                <div className='flex justify-between items-center'>
                  <p className='text-sm text-gray-500'>
                    Supports markdown formatting (bold, italic, lists, links,
                    etc.)
                  </p>
                  <span className='text-sm text-gray-400'>
                    {formData.description.length} characters
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsEditOpen(false);
                    resetForm();
                  }}
                  className='hover:bg-gray-300 hover:text-black'
                >
                  Cancel
                </Button>
                <Button
                  className='bg-primary hover:bg-primary/90 text-[#141b34]'
                  onClick={handleSubmit}
                >
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
