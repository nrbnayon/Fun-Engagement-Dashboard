// src/app/(dashboard)/components/PlayerList.tsx
"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { Plus, Upload, X, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { generatePlayersData, Player } from "@/lib/data/players";

interface PlayersPageProps {
  itemsPerPage?: number;
}

interface FormData {
  playerImage: string;
  playerName: string;
  jerseyNo: string;
  status: "active" | "inactive" | "pending" | "waiting";
}

export default function PlayerListPage({
  itemsPerPage = 12,
}: PlayersPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>(() =>
    generatePlayersData(100)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    playerImage: "",
    playerName: "",
    jerseyNo: "",
    status: "active",
  });

  const filteredData = players;

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
          playerImage: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      setPlayers((prev) =>
        prev.filter((player) => player.id !== playerToDelete.id)
      );
      toast.success("Player deleted successfully!");
      setDeleteConfirmOpen(false);
      setPlayerToDelete(null);
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
          playerImage: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      playerImage: "",
      playerName: "",
      jerseyNo: "",
      status: "active",
    });
    setEditingPlayer(null);
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.playerName || !formData.jerseyNo || !formData.status) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingPlayer) {
      // Update existing player
      const updatedPlayer: Player = {
        id: editingPlayer.id,
        playerImage: formData.playerImage || "/ellipse-2-7.png",
        playerName: formData.playerName,
        jerseyNo: formData.jerseyNo,
        status: formData.status,
      };

      setPlayers((prev) =>
        prev.map((player) =>
          player.id === editingPlayer.id ? updatedPlayer : player
        )
      );
      toast.success("Player updated successfully!");
    } else {
      // Create new player
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        playerImage: formData.playerImage || "/ellipse-2-7.png",
        playerName: formData.playerName,
        jerseyNo: formData.jerseyNo,
        status: formData.status,
      };

      // Add to players list
      setPlayers((prev) => [newPlayer, ...prev]);
      toast.success("Player added successfully!");
    }

    // Reset form and close modal
    resetForm();
    setIsAddPlayerOpen(false);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      playerImage: player.playerImage,
      playerName: player.playerName,
      jerseyNo: player.jerseyNo,
      status: player.status,
    });
    setIsAddPlayerOpen(true);
  };

  const handleDelete = (player: Player) => {
    setPlayerToDelete(player);
    setDeleteConfirmOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "waiting":
        return "text-blue-600 bg-blue-200";
      default:
        return "text-gray-600 bg-gray-100";
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
          Players
        </h1>
        <Button
          className="bg-primary hover:bg-primary/90 text-black"
          onClick={() => setIsAddPlayerOpen(true)}
        >
          <Plus size={18} />
          Add Player
        </Button>
      </div>

      {/* Players Table */}
      <Card className="w-full rounded-xl overflow-hidden border-border p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border-collapse min-w-5xl">
              <TableHeader className="border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300">
                <TableRow>
                  <TableHead className="font-normal text-secondary pl-6 py-4 min-w-24">
                    Player
                  </TableHead>
                  <TableHead className="font-normal text-secondary pl-5 py-4 min-w-44">
                    Player Name
                  </TableHead>
                  <TableHead className="font-normal text-center text-secondary py-4 min-w-28">
                    Jersey Number
                  </TableHead>
                  <TableHead className="font-normal text-center text-secondary py-4 min-w-24">
                    Status
                  </TableHead>
                  <TableHead className="font-normal text-center text-secondary py-4 min-w-24">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {currentData.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="px-6 py-4 min-w-24">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <Image
                            className="w-9 h-9 object-cover rounded-full"
                            alt={`${player.playerName} avatar`}
                            src={player.playerImage}
                            width={36}
                            height={36}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 min-w-44">
                      <span className="font-normal text-blackblack-700 text-xl">
                        {player.playerName}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center min-w-28">
                      <div className="font-normal text-blackblack-700 text-xl">
                        {player.jerseyNo}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center min-w-24">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                          player.status
                        )}`}
                      >
                        {player.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center min-w-24">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer"
                          onClick={() => handleEdit(player)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDelete(player)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center w-full mt-5">
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

      {/* Add/Edit Player Dialog */}
      <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
        <DialogContent
          className="sm:max-w-md p-0 overflow-hidden"
          showCloseButton={false}
        >
          <DialogHeader className="bg-primary p-4 flex flex-row items-center justify-between">
            <DialogTitle className="text-[#141b34] text-xl">
              {editingPlayer ? "Edit Player" : "Add Player"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary-light rounded-full border-2 border-red-500"
              onClick={() => {
                setIsAddPlayerOpen(false);
                resetForm();
              }}
            >
              <X className="h-5 w-5 text-red-500" />
            </Button>
          </DialogHeader>
          <div className="p-4 pt-0">
            {/* Player Image Upload */}
            <div className="space-y-2 mb-4">
              <label className="font-medium text-[#141b34]">Player Image</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.playerImage ? (
                  <div className="relative">
                    <Image
                      src={formData.playerImage}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="mx-auto rounded-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, playerImage: "" }));
                      }}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop an image or click to browse
                    </p>
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

            <div className="space-y-2 mb-2">
              <label className="font-medium text-[#141b34]">
                Player Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter player name"
                className="mt-1"
                value={formData.playerName}
                onChange={(e) =>
                  handleInputChange("playerName", e.target.value)
                }
              />
            </div>

            <div className="flex justify-between items-start gap-5 mb-4">
              <div className="space-y-2 w-1/2">
                <label className="font-medium text-[#141b34]">
                  Jersey Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., 10"
                  className="mt-1"
                  value={formData.jerseyNo}
                  onChange={(e) =>
                    handleInputChange("jerseyNo", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2 w-1/2">
                <label className="font-medium text-[#141b34]">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleInputChange("status", value as FormData["status"])
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddPlayerOpen(false);
                  resetForm();
                }}
                className="hover:bg-blue-100"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-[#141b34]"
                onClick={handleSubmit}
              >
                {editingPlayer ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete `{playerToDelete?.playerName}`?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteConfirmOpen(false)}
              className="hover:bg-blue-100"
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
