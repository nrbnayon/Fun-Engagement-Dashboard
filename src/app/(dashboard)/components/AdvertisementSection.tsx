// src\app\(dashboard)\components\AdvertisementSection.tsx
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
import { Plus, Upload, X, Edit, Trash2, ExternalLink } from "lucide-react";
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

interface Advertisement {
  id: string;
  image: string;
  url?: string;
  createTime: string;
}

interface AdvertisementSectionProps {
  itemsPerPage?: number;
}

interface FormData {
  image: string;
  url: string;
}

// Generate sample advertisement data
const generateAdvertisementData = (count: number): Advertisement[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `ad-${index + 1}`,
    image: `/ad-placeholder.png`,
    url: index % 3 === 0 ? `https://example.com/ad-${index + 1}` : undefined,
    createTime: new Date(
      Date.now() - Math.random() * 10000000000
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));
};

export default function AdvertisementSection({
  itemsPerPage = 12,
}: AdvertisementSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddAdOpen, setIsAddAdOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() =>
    generateAdvertisementData(20)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    image: "",
    url: "",
  });

  const filteredData = advertisements;

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
    if (adToDelete) {
      setAdvertisements((prev) =>
        prev.filter((item) => item.id !== adToDelete.id)
      );
      toast.success("Advertisement deleted successfully!");
      setDeleteConfirmOpen(false);
      setAdToDelete(null);
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
      url: "",
    });
    setEditingAd(null);
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.image) {
      toast.error("Please upload an image");
      return;
    }

    // Validate URL format if provided
    if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    if (editingAd) {
      // Update existing advertisement
      const updatedAd: Advertisement = {
        id: editingAd.id,
        image: formData.image,
        url: formData.url || undefined,
        createTime: editingAd.createTime, // Keep original create time
      };

      setAdvertisements((prev) =>
        prev.map((item) => (item.id === editingAd.id ? updatedAd : item))
      );
      toast.success("Advertisement updated successfully!");
    } else {
      // Create new advertisement
      const newAd: Advertisement = {
        id: `ad-${Date.now()}`,
        image: formData.image,
        url: formData.url || undefined,
        createTime: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      // Add to advertisements list
      setAdvertisements((prev) => [newAd, ...prev]);
      toast.success("Advertisement added successfully!");
    }

    // Reset form and close modal
    resetForm();
    setIsAddAdOpen(false);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      image: ad.image,
      url: ad.url || "",
    });
    setIsAddAdOpen(true);
  };

  const handleDelete = (ad: Advertisement) => {
    setAdToDelete(ad);
    setDeleteConfirmOpen(true);
  };

  const handleAdClick = (ad: Advertisement) => {
    if (ad.url) {
      window.open(ad.url, "_blank", "noopener,noreferrer");
    }
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
        <h1 className="text-2xl font-bold text-secondary font-oswald">
          Advertisements
        </h1>
        <Button
          className="bg-primary hover:bg-primary/90 text-black rounded-xl px-6 py-2"
          onClick={() => setIsAddAdOpen(true)}
        >
          <Plus size={18} />
          Add Advertisement
        </Button>
      </div>

      {/* Advertisement Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentData.map((ad) => (
          <Card
            key={ad.id}
            className="overflow-hidden border p-4 border-border bg-[#FBFDFF] dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative rounded-xl">
              <div
                className={`relative ${ad.url ? "cursor-pointer" : ""}`}
                onClick={() => handleAdClick(ad)}
              >
                <Image
                  src={ad.image}
                  alt="Advertisement"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-xl"
                />
                {ad.url && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
                    <ExternalLink
                      className="text-white opacity-0 hover:opacity-100 transition-opacity"
                      size={24}
                    />
                  </div>
                )}
              </div>
              {/* Action buttons overlay */}
              <div className="absolute top-0.5 right-0.5 flex gap-1">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-800 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(ad);
                  }}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white text-red-600 hover:text-red-800 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(ad);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            <CardContent className="px-0 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {ad.createTime}
                </span>
                {ad.url && (
                  <div
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(ad.url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ExternalLink size={12} />
                    <span>Linked</span>
                  </div>
                )}
              </div>
              {ad.url && (
                <p
                  className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(ad.url, "_blank", "noopener,noreferrer");
                  }}
                  title={ad.url}
                >
                  {ad.url}
                </p>
              )}
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

      {/* Add/Edit Advertisement Dialog */}
      <Dialog open={isAddAdOpen} onOpenChange={setIsAddAdOpen}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          showCloseButton={false}
        >
          <DialogHeader className="bg-primary p-4 flex flex-row items-center justify-between">
            <DialogTitle className="text-[#141b34] text-xl">
              {editingAd ? "Edit Advertisement" : "Add Advertisement"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary-light rounded-full border-2 border-red-500"
              onClick={() => {
                setIsAddAdOpen(false);
                resetForm();
              }}
            >
              <X className="h-5 w-5 text-red-500" />
            </Button>
          </DialogHeader>
          <div className="p-6 space-y-4 pt-0">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="font-medium text-[#141b34] dark:text-white">
                Advertisement Image <span className="text-red-500">*</span>
              </label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
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
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Upload
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
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

            {/* URL */}
            <div className="space-y-2">
              <label className="font-medium text-[#141b34] dark:text-white">
                Link URL <span className="text-gray-500">(Optional)</span>
              </label>
              <Input
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                className="text-base"
                type="url"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                URL must start with http:// or https:// to make the
                advertisement clickable
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddAdOpen(false);
                  resetForm();
                }}
                className="hover:bg-gray-300 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-[#141b34]"
                onClick={handleSubmit}
              >
                {editingAd ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this advertisement? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteConfirmOpen(false)}
              className="hover:bg-gray-300 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white"
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