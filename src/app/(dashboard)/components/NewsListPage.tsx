// src/app/(dashboard)/components/NewsListPage.tsx
"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { Plus, Upload, X, Edit, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { generateNewsData, News } from "@/lib/data/news";
import Link from "next/link";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface NewsPageProps {
  itemsPerPage?: number;
}

interface FormData {
  image: string;
  title: string;
  description: string;
}

export default function NewsListPage({ itemsPerPage = 12 }: NewsPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
  const [news, setNews] = useState<News[]>(() => generateNewsData(50));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    image: "",
    title: "",
    description: "",
  });

  const filteredData = news;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
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
        const result = e.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          image: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = () => {
    if (newsToDelete) {
      setNews((prev) => prev.filter((item) => item.id !== newsToDelete.id));
      toast.success("News deleted successfully!");
      setDeleteConfirmOpen(false);
      setNewsToDelete(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          image: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      image: "",
      title: "",
      description: "",
    });
    setEditingNews(null);
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingNews) {
      // Update existing news
      const updatedNews: News = {
        id: editingNews.id,
        image: formData.image || "/news-placeholder.jpg",
        title: formData.title,
        description: formData.description,
        createTime: editingNews.createTime, // Keep original create time
      };

      setNews((prev) =>
        prev.map((item) => (item.id === editingNews.id ? updatedNews : item))
      );
      toast.success("News updated successfully!");
    } else {
      // Create new news
      const newNews: News = {
        id: `news-${Date.now()}`,
        image: formData.image || "/news-placeholder.jpg",
        title: formData.title,
        description: formData.description,
        createTime: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      // Add to news list
      setNews((prev) => [newNews, ...prev]);
      toast.success("News added successfully!");
    }

    // Reset form and close modal
    resetForm();
    setIsAddNewsOpen(false);
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      image: newsItem.image,
      title: newsItem.title,
      description: newsItem.description,
    });
    setIsAddNewsOpen(true);
  };

  const handleDelete = (newsItem: News) => {
    setNewsToDelete(newsItem);
    setDeleteConfirmOpen(true);
  };

  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold text-secondary font-oswald">News</h1>
        <Button
          className="bg-primary hover:bg-primary/90 text-black rounded-xl px-6 py-2"
          onClick={() => setIsAddNewsOpen(true)}
        >
          <Plus size={18} />
          Add News
        </Button>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentData.map((newsItem) => (
          <Card
            key={newsItem.id}
            className="overflow-hidden border border-border bg-[#FBFDFF] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative px-2 rounded-xl">
              <Image
                src={newsItem?.image}
                alt={newsItem.title}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-800"
                  onClick={() => handleEdit(newsItem)}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(newsItem)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-sm text-gray-500">
                  {newsItem.createTime}
                </span>
              </div>
              <Link href={`/news/${newsItem.id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer font-oswald">
                  {newsItem.title}
                </h3>
              </Link>
              <div
                className="text-sm text-gray-600 line-clamp-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    newsItem.description.length > 150
                      ? newsItem.description.substring(0, 150) + "..."
                      : newsItem.description,
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center w-full mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {generatePageNumbers().map((pageNum, index) => (
                <PaginationItem key={index}>
                  {pageNum === "..." ? (
                    <span className="px-3 py-2">...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum as number)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add/Edit News Dialog */}
      <Dialog open={isAddNewsOpen} onOpenChange={setIsAddNewsOpen}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          showCloseButton={false}
        >
          <DialogHeader className="bg-primary p-4  flex flex-row items-center justify-between">
            <DialogTitle className="text-[#141b34] text-xl">
              {editingNews ? "Edit News" : "Add News"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary-light rounded-full border-2 border-red-500"
              onClick={() => {
                setIsAddNewsOpen(false);
                resetForm();
              }}
            >
              <X className="h-5 w-5 text-red-500" />
            </Button>
          </DialogHeader>
          <div className="p-6 space-y-4 pt-0">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="font-medium text-[#141b34]">News Image</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.image ? (
                  <div className="relative">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      width={200}
                      height={120}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, image: "" }));
                      }}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Upload
                      </p>
                      <p className="text-sm text-gray-500">
                        Drag and drop an image or click to browse
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="font-medium text-[#141b34]">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter news title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-base"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="font-medium text-[#141b34]">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <MDEditor
                  value={formData.description}
                  onChange={(value) =>
                    handleInputChange("description", value || "")
                  }
                  preview="edit"
                  hideToolbar={false}
                  visibleDragbar={false}
                  data-color-mode="light"
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
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Supports markdown formatting (bold, italic, lists, links,
                  etc.)
                </p>
                <span className="text-sm text-gray-400">
                  {formData.description.length} characters
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddNewsOpen(false);
                  resetForm();
                }}
                className="hover:bg-gray-300 hover:text-black"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-[#141b34]"
                onClick={handleSubmit}
              >
                {editingNews ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete `{newsToDelete?.title}`? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteConfirmOpen(false)}
              className="hover:bg-gray-300 hover:text-black"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
