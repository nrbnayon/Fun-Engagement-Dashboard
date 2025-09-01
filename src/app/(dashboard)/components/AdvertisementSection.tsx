// src\app\(dashboard)\components\AdvertisementSection.tsx
"use client";
import { useState, useRef, useEffect } from "react";
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
import {
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} from "@/lib/services/advertisementDataApi";
import { getFullImageUrl } from "@/lib/utils";

interface Advertisement {
  id: number;
  title: string;
  url: string | null;
  image: string | null;
  created_at: string;
}

interface AdvertisementSectionProps {
  itemsPerPage?: number;
}

interface FormData {
  title: string;
  image: File | null;
  url: string;
}

export default function AdvertisementSection({
  itemsPerPage = 12,
}: AdvertisementSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddAdOpen, setIsAddAdOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    image: null,
    url: "",
  });

  // Fetch advertisements on component mount
  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await getAllAdvertisements();
      if (response.success && response.data) {
        setAdvertisements(response.data);
      } else {
        toast.error("Failed to fetch advertisements");
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      toast.error("Error fetching advertisements");
    } finally {
      setLoading(false);
    }
  };

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
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes

      if (file.size > maxSize) {
        toast.error(
          "Image size must not exceed 5MB. Please choose a smaller image."
        );
        // Reset the input value to allow selecting the same file again after error
        if (event.target) {
          event.target.value = "";
        }
        return;
      }

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        if (event.target) {
          event.target.value = "";
        }
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = async () => {
    if (adToDelete) {
      try {
        setSubmitting(true);
        const response = await deleteAdvertisement(adToDelete.id);
        if (response.success) {
          setAdvertisements((prev) =>
            prev.filter((item) => item.id !== adToDelete.id)
          );
          toast.success("Advertisement deleted successfully!");
        } else {
          toast.error("Failed to delete advertisement");
        }
      } catch (error) {
        console.error("Error deleting advertisement:", error);
        toast.error("Error deleting advertisement");
      } finally {
        setSubmitting(false);
        setDeleteConfirmOpen(false);
        setAdToDelete(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes

      if (file.size > maxSize) {
        toast.error(
          "Image size must not exceed 5MB. Please choose a smaller image."
        );
        return;
      }

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image: null,
      url: "",
    });
    setImagePreview("");
    setEditingAd(null);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!editingAd && !formData.image) {
      toast.error("Please upload an image");
      return;
    }

    // Validate URL format if provided
    if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    try {
      setSubmitting(true);

      if (editingAd) {
        // Update existing advertisement
        // Ensure image is File or undefined, never null
        const updateData: {
          title: string;
          url?: string;
          image?: File;
        } = {
          title: formData.title,
        };

        if (formData.url) {
          updateData.url = formData.url;
        }

        if (formData.image !== null && formData.image !== undefined) {
          updateData.image = formData.image;
        }

        const response = await updateAdvertisement(editingAd.id, updateData);

        if (response.success) {
          // Refresh the data
          await fetchAdvertisements();
          toast.success("Advertisement updated successfully!");
        } else {
          toast.error("Failed to update advertisement");
        }
      } else {
        // Create new advertisement
        const createData = {
          title: formData.title,
          image: formData.image === null ? undefined : formData.image,
          url: formData.url,
        };

        if (formData.url) {
          createData.url = formData.url;
        }

        const response = await createAdvertisement(createData);

        if (response.success) {
          // Refresh the data
          await fetchAdvertisements();
          toast.success("Advertisement added successfully!");
        } else {
          toast.error("Failed to create advertisement");
        }
      }

      // Reset form and close modal
      resetForm();
      setIsAddAdOpen(false);
    } catch (error) {
      console.error("Error submitting advertisement:", error);
      toast.error("Error submitting advertisement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image: null,
      url: ad.url || "",
    });

    // Set image preview if exists
    if (ad.image) {
      setImagePreview(ad.image);
    }

    setIsAddAdOpen(true);
  };

  const handleDelete = (ad: Advertisement) => {
    setAdToDelete(ad);
    setDeleteConfirmOpen(true);
  };

  const handleAdClick = (ad: Advertisement) => {
    if (ad.url) {
      window.open(ad.url!, "_blank", "noopener,noreferrer");
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full space-y-6">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold text-secondary font-oswald">
            Advertisements
          </h1>
          <Button
            className="bg-primary hover:bg-primary/90 text-black rounded-xl px-6 py-2"
            disabled
          >
            <Plus size={18} />
            Add Advertisement
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card
              key={index}
              className="overflow-hidden border p-4 border-border bg-[#FBFDFF] dark:bg-gray-800 rounded-2xl shadow-sm animate-pulse"
            >
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold text-secondary font-oswald">
          Advertisements
        </h1>
        {advertisements.length < 1 && (
          <Button
            className="bg-primary hover:bg-primary/90 text-black rounded-xl px-6 py-2"
            onClick={() => setIsAddAdOpen(true)}
          >
            <Plus size={18} />
            Add Advertisement
          </Button>
        )}
      </div>

      {/* No data message */}
      {advertisements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No advertisements found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by adding your first advertisement.
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-black"
              onClick={() => setIsAddAdOpen(true)}
            >
              <Plus size={18} />
              Add Advertisement
            </Button>
          </div>
        </div>
      )}

      {/* Advertisement Cards Grid */}
      {advertisements.length > 0 && (
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
                    src={getFullImageUrl(ad.image) ?? ""}
                    alt={ad.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/ad-placeholder.png";
                    }}
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
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {ad.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(ad.created_at)}
                  </span>
                  {ad.url && (
                    <div
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (ad.url)
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
                      window.open(ad.url!, "_blank", "noopener,noreferrer");
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
      )}

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
            {/* Title */}
            <div className="space-y-2">
              <label className="font-medium text-[#141b34] dark:text-white">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter advertisement title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-base"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="font-medium text-[#141b34] dark:text-white">
                Advertisement Image{" "}
                {!editingAd && <span className="text-red-500">*</span>}
              </label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={
                        imagePreview.startsWith("data:")
                          ? imagePreview
                          : getFullImageUrl(imagePreview ?? "")
                      }
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
                        setFormData((prev) => ({ ...prev, image: null }));
                        setImagePreview("");
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
                        Drag and drop an image or click to browse (Max 5MB)
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
                disabled={submitting}
                className="hover:bg-gray-300 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-[#141b34]"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Processing..." : editingAd ? "Update" : "Submit"}
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
              disabled={submitting}
              className="hover:bg-gray-300 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
