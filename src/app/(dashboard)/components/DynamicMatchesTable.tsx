"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Edit,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn, getFullImageUrl } from "@/lib/utils";
import { getAllMatch, deleteMatch } from "@/lib/services/matchDataApi";
import { getAllPlayers } from "@/lib/services/playlistDataApi";
import apiEndpoint from "@/lib/axios";
import { toast } from "sonner";

// Types based on your API response
interface Player {
  id: number;
  image: string;
  jersey_number: number;
  name: string;
  status: string;
}

interface MatchData {
  id: number;
  team_a: string;
  team_b: string;
  team_a_pics: string | null;
  team_b_pics: string | null;
  time: string;
  date: string;
  status: string;
  selected_players: Player[];
  win_name?: string | null;
  winner?: string | null;
  goal_difference?: number;
}

interface AvailablePlayer {
  id: string;
  name: string;
  image: string;
  jersey: number;
}

interface MatchesOverviewProps {
  limit?: number;
  paginate?: boolean;
  itemsPerPage?: number;
  title?: string | boolean;
  status?: string;
  addMatch?: boolean;
  showActions?: boolean;
  onMatchUpdate?: () => void;
}

interface FormData {
  teamAName: string;
  teamBName: string;
  time: string;
  date: Date | undefined;
  selectedPlayers: string[];
  teamAImage: File | null;
  teamBImage: File | null;
  status?: string;
  winner?: string;
  goal_difference?: number;
}

export default function DynamicMatchesTable({
  limit = 5,
  paginate = false,
  itemsPerPage = 12,
  title = true,
  status = "all",
  addMatch = false,
  showActions = true,
  onMatchUpdate,
}: MatchesOverviewProps) {
  const [allMatchesData, setAllMatchesData] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Add/Edit Match Dialog States
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [isEditMatchOpen, setIsEditMatchOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    teamAName: "",
    teamBName: "",
    time: "",
    date: undefined,
    selectedPlayers: [],
    teamAImage: null,
    teamBImage: null,
    status: "upcoming",
    winner: "no_winner",
  });

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<MatchData | null>(null);

  // Remove the mock data and replace with API call
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>(
    []
  );
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Add useEffect to fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      try {
        const response = await getAllPlayers();
        if (response.success && Array.isArray(response.data)) {
          const formattedPlayers = response.data.map((player: Player) => ({
            id: player.id.toString(),
            name: player.name,
            image: player.image,
            jersey: player.jersey_number,
          }));
          setAvailablePlayers(formattedPlayers);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, []);

  // Fetch matches data from API
  useEffect(() => {
    fetchMatchesData();
  }, []);

  const fetchMatchesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllMatch();
      if (response.success && Array.isArray(response.data)) {
        setAllMatchesData(response.data);
      } else {
        setError("Failed to fetch matches data");
      }
    } catch (err) {
      console.error("Error fetching matches data:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get team initials from team name
  const getTeamInitials = (teamName: string) => {
    return teamName
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour24 = Number.parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Filter matches based on status
  const getFilteredMatches = () => {
    if (status === "all") {
      return allMatchesData;
    }
    return allMatchesData.filter(
      (match) => match.status.toLowerCase() === status.toLowerCase()
    );
  };

  // Get filtered data
  const filteredMatches = getFilteredMatches();

  // Determine data to show based on pagination and limit
  const dataToShow = paginate
    ? filteredMatches
    : filteredMatches.slice(0, limit);

  // Calculate pagination
  const totalPages = paginate
    ? Math.ceil(filteredMatches.length / itemsPerPage)
    : 1;

  const startIndex = paginate ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = paginate ? startIndex + itemsPerPage : dataToShow.length;

  const currentData = paginate
    ? filteredMatches.slice(startIndex, endIndex)
    : dataToShow;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  // Get status display component
  const getStatusDisplay = (match: MatchData) => {
    switch (match.status.toLowerCase()) {
      case "live":
        return (
          <div className='font-normal text-red-500 text-xl capitalize'>
            🔴 Live
          </div>
        );
      case "upcoming":
        return (
          <div className='font-normal text-blue-500 text-xl capitalize'>
            📅 Upcoming
          </div>
        );
      case "finished":
        return (
          <div className='font-normal text-green-500 text-xl capitalize'>
            ✅ Finished
          </div>
        );
      case "voting":
        return (
          <div className='font-normal text-purple-500 text-xl capitalize'>
            🗳️ Voting
          </div>
        );
      default:
        return (
          <div className='font-normal text-gray-500 text-xl capitalize'>
            {match.status}
          </div>
        );
    }
  };

  // Get winner display component
  const getWinnerDisplay = (match: MatchData) => {
    if (match.status.toLowerCase() !== "finished") {
      return null;
    }

    if (!match.winner || !match.win_name) {
      return (
        <div className='font-normal text-gray-500 text-lg'>
          Draw / No Result
        </div>
      );
    }

    return (
      <div className='font-semibold text-green-600 text-lg'>
        🏆 {match.win_name}
        {match.goal_difference !== undefined && (
          <span className='ml-2 text-sm text-gray-600'>
            (GD: {match.goal_difference})
          </span>
        )}
      </div>
    );
  };

  // Dynamic table headers based on status
  const getTableHeaders = () => {
    const baseHeaders = [
      {
        key: "teamA",
        label: "Team A",
        className: "font-normal text-secondary pl-8 py-4 min-w-32",
      },
      {
        key: "teamB",
        label: "Team B",
        className: "font-normal text-secondary pl-6 py-4 min-w-32",
      },
      {
        key: "time",
        label: "Time",
        className: "font-normal text-center text-secondary py-4 min-w-24",
      },
      {
        key: "date",
        label: "Date",
        className: "font-normal text-center text-secondary py-4 min-w-28",
      },
    ];

    if (status === "all") {
      baseHeaders.push({
        key: "status",
        label: "Status",
        className: "font-normal text-center text-secondary py-4 min-w-32",
      });
      baseHeaders.push({
        key: "result",
        label: "Result",
        className: "font-normal text-center text-secondary py-4 min-w-32",
      });
    } else if (status.toLowerCase() === "finished") {
      baseHeaders.push({
        key: "result",
        label: "Winner",
        className: "font-normal text-center text-secondary py-4 min-w-32",
      });
    } else {
      baseHeaders.push({
        key: "status",
        label: "Status",
        className: "font-normal text-center text-secondary py-4 min-w-32",
      });
    }

    baseHeaders.push({
      key: "players",
      label: "Players",
      className: "font-normal text-center text-secondary py-4 min-w-48",
    });

    if (showActions) {
      baseHeaders.push({
        key: "actions",
        label: "Actions",
        className: "font-normal text-center text-secondary py-4 min-w-32",
      });
    }

    return baseHeaders;
  };

  const tableHeaders = getTableHeaders();

  // Get title display
  const getTitleDisplay = () => {
    if (title === false || title === "") return null;

    if (typeof title === "string") {
      return title;
    }

    // Default titles based on status
    switch (status.toLowerCase()) {
      case "live":
        return "Live Matches";
      case "upcoming":
        return "Upcoming Matches";
      case "finished":
        return "Finished Matches";
      case "voting":
        return "Voting Matches";
      default:
        return "Matches List";
    }
  };

  const displayTitle = getTitleDisplay();

  // Add/Edit Match Dialog Functions
  const handleInputChange = (
    field: keyof FormData,
    value: string | string[] | Date | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddPlayer = (playerId: string) => {
    if (!formData.selectedPlayers.includes(playerId)) {
      setFormData((prev) => ({
        ...prev,
        selectedPlayers: [...prev.selectedPlayers, playerId],
      }));
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.filter((id) => id !== playerId),
    }));
  };

  const handleImageUpload = (team: "A" | "B", file: File) => {
    const field = team === "A" ? "teamAImage" : "teamBImage";
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const resetForm = () => {
    setFormData({
      teamAName: "",
      teamBName: "",
      time: "",
      date: undefined,
      selectedPlayers: [],
      teamAImage: null,
      teamBImage: null,
      status: "upcoming",
      winner: "no_winner",
      goal_difference: undefined,
    });
    setEditingMatch(null);
  };

  const convertTimeToAPI = (timeStr: string) => {
    // Convert from "14:30" format to "14:30:00" format
    if (timeStr && !timeStr.includes(":00")) {
      return `${timeStr}:00`;
    }
    return timeStr;
  };

  const convertDateToAPI = (date: Date | undefined) => {
    // Convert Date object to "yyyy-mm-dd" format
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const convertTimeFromAPI = (timeStr: string) => {
    // Convert from "17:00:00" format to "17:00" format
    try {
      const [hours, minutes] = timeStr.split(":");
      return `${hours}:${minutes}`;
    } catch {
      return timeStr;
    }
  };

  const convertDateFromAPI = (dateStr: string) => {
    // Convert from "yyyy-mm-dd" format to Date object
    try {
      return new Date(dateStr);
    } catch {
      return undefined;
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (
        !formData.teamAName ||
        !formData.teamBName ||
        !formData.time ||
        !formData.date
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Create FormData for multipart/form-data
      const submitFormData = new FormData();
      submitFormData.append("team_a", formData.teamAName);
      submitFormData.append("team_b", formData.teamBName);
      submitFormData.append("time", convertTimeToAPI(formData.time));
      submitFormData.append("date", convertDateToAPI(formData.date));

      formData.selectedPlayers.forEach((playerId) => {
        submitFormData.append("selected_players_ids", playerId);
      });

      if (formData.status) {
        submitFormData.append("status", formData.status);
      }

      if (formData.winner && formData.winner !== "no_winner") {
        submitFormData.append("winner", formData.winner);
      }

      if (formData.goal_difference !== undefined) {
        submitFormData.append(
          "goal_difference",
          formData.goal_difference.toString()
        );
      }

      if (formData.teamAImage) {
        submitFormData.append("team_a_pics", formData.teamAImage);
      }
      if (formData.teamBImage) {
        submitFormData.append("team_b_pics", formData.teamBImage);
      }

      let response;
      if (editingMatch) {
        response = await apiEndpoint.put(
          `/matches/${editingMatch.id}/`,
          submitFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 30000,
          }
        );
      } else {
        response = await apiEndpoint.post("/matches/", submitFormData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        });
      }

      if (response.data) {
        await fetchMatchesData();
        if (onMatchUpdate) {
          onMatchUpdate();
        }
        setIsAddMatchOpen(false);
        setIsEditMatchOpen(false);
        resetForm();
        toast.success(
          editingMatch
            ? "Match updated successfully!"
            : "Match created successfully!"
        );
      }
    } catch (error) {
      console.error("Error submitting match:", error);
      toast.error("An error occurred while submitting the match.");
    }
  };

  const handleEdit = (match: MatchData) => {
    setEditingMatch(match);
    setFormData({
      teamAName: match.team_a,
      teamBName: match.team_b,
      time: convertTimeFromAPI(match.time),
      date: convertDateFromAPI(match.date),
      selectedPlayers: match.selected_players.map((p) => p.id.toString()),
      teamAImage: null,
      teamBImage: null,
      status: match.status,
      winner: match.winner || "no_winner",
      goal_difference: match.goal_difference,
    });
    setIsEditMatchOpen(true);
  };

  const handleDeleteClick = (match: MatchData) => {
    setMatchToDelete(match);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!matchToDelete) return;

    try {
      const response = await deleteMatch(matchToDelete.id);
      if (response.success) {
        await fetchMatchesData();
        if (onMatchUpdate) {
          onMatchUpdate();
        }
        toast.success("Match deleted successfully!");
      } else {
        toast.error("Failed to delete match.");
      }
    } catch (error) {
      console.error("Error deleting match:", error);
      toast.error("An error occurred while deleting the match.");
    } finally {
      setIsDeleteModalOpen(false);
      setMatchToDelete(null);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Title and See All/Add Match Link */}
      {(displayTitle || (!paginate && !addMatch) || addMatch) && (
        <div className='flex items-center justify-between w-full font-oswald'>
          {displayTitle && (
            <h2 className='text-2xl font-bold text-secondary font-oswald'>
              {displayTitle}
            </h2>
          )}

          {!paginate && !addMatch && (
            <Link
              href='/matches'
              className='text-secondary text-base tracking-[0] leading-[normal] hover:underline'
            >
              See All
            </Link>
          )}

          {addMatch && (
            <Button
              className='bg-primary hover:bg-primary/90 text-black'
              onClick={() => setIsAddMatchOpen(true)}
            >
              <Plus size={18} />
              Add Match
            </Button>
          )}
        </div>
      )}

      {/* Matches Table */}
      <Card className='w-full rounded-xl overflow-hidden border-border p-0'>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table className='border-collapse min-w-3xl'>
              <TableHeader className='border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300'>
                <TableRow>
                  {tableHeaders.map((header) => (
                    <TableHead key={header.key} className={header.className}>
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className='bg-white'>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={tableHeaders.length}
                      className='text-center py-8'
                    >
                      <div className='font-normal text-blackblack-700 text-xl'>
                        Loading matches...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={tableHeaders.length}
                      className='text-center py-8'
                    >
                      <div className='font-normal text-red-500 text-xl'>
                        Error: {error}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={tableHeaders.length}
                      className='text-center py-8'
                    >
                      <div className='font-normal text-blackblack-700 text-xl'>
                        No {status === "all" ? "" : status} matches available
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((match, index) => (
                    <TableRow key={`${status}-${match.id || index}`}>
                      {/* Team A */}
                      <TableCell className='px-6 py-4 min-w-32'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 flex items-center justify-center'>
                            {match.team_a_pics ? (
                              <Image
                                className='w-9 h-9 object-contain'
                                alt={`${match.team_a} logo`}
                                src={
                                  getFullImageUrl(match.team_a_pics) ||
                                  "/logo.png"
                                }
                                width={36}
                                height={36}
                              />
                            ) : (
                              <div className='w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm'>
                                {getTeamInitials(match.team_a)}
                              </div>
                            )}
                          </div>
                          <span className='font-normal text-blackblack-700 text-xl'>
                            {match.team_a}
                          </span>
                        </div>
                      </TableCell>

                      {/* Team B */}
                      <TableCell className='px-6 py-4 min-w-32'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 flex items-center justify-center'>
                            {match.team_b_pics ? (
                              <Image
                                className='w-9 h-9 object-contain'
                                alt={`${match.team_b} logo`}
                                src={
                                  getFullImageUrl(match.team_b_pics) ||
                                  "/logo.png"
                                }
                                width={36}
                                height={36}
                              />
                            ) : (
                              <div className='w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm'>
                                {getTeamInitials(match.team_b)}
                              </div>
                            )}
                          </div>
                          <span className='font-normal text-blackblack-700 text-xl'>
                            {match.team_b}
                          </span>
                        </div>
                      </TableCell>

                      {/* Time */}
                      <TableCell className='px-6 py-4 text-center min-w-24'>
                        <div className='font-normal text-blackblack-700 text-xl'>
                          {formatTime(match.time)}
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className='px-6 py-4 text-center min-w-28'>
                        <div className='font-normal text-blackblack-700 text-xl'>
                          {formatDate(match.date)}
                        </div>
                      </TableCell>

                      {/* Status (conditional) */}
                      {(status === "all" ||
                        status.toLowerCase() !== "finished") && (
                        <TableCell className='px-6 py-4 text-center min-w-32'>
                          {getStatusDisplay(match)}
                        </TableCell>
                      )}

                      {/* Result/Winner (conditional) */}
                      {(status === "all" ||
                        status.toLowerCase() === "finished") && (
                        <TableCell className='px-6 py-4 text-center min-w-32'>
                          {getWinnerDisplay(match)}
                        </TableCell>
                      )}

                      {/* Players */}
                      <TableCell className='px-6 py-4 min-w-48'>
                        <div className='flex items-center justify-center'>
                          {match.selected_players &&
                          match.selected_players.length > 0 ? (
                            match.selected_players
                              .slice(0, 8)
                              .map((player: Player, idx: number) => (
                                <Avatar
                                  key={player.id || idx}
                                  className={`${
                                    idx > 0 ? "-ml-2" : ""
                                  } relative z-10`}
                                  title={player.name}
                                >
                                  <AvatarImage
                                    className='w-10 h-10 object-cover rounded-full border-2 border-border'
                                    alt={player.name}
                                    src={
                                      getFullImageUrl(player.image ?? "") ||
                                      "/user.png"
                                    }
                                  />
                                </Avatar>
                              ))
                          ) : (
                            <span className='font-normal text-gray-500 text-sm'>
                              No players selected
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      {showActions && (
                        <TableCell className='px-6 py-4 text-center min-w-32'>
                          <div className='flex items-center justify-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleEdit(match)}
                              className='h-8 px-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleDeleteClick(match)}
                              className='h-8 px-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination - only show when paginate is true and there are multiple pages */}
      {paginate && totalPages > 1 && !loading && !error && (
        <div className='flex justify-center w-full mt-5'>
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
                    <span className='px-3 py-2'>...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum as number)}
                      isActive={currentPage === pageNum}
                      className='cursor-pointer'
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

      {/* Add Match Dialog */}
      {/* Add Match Dialog */}
      <Dialog open={isAddMatchOpen} onOpenChange={setIsAddMatchOpen}>
        <DialogContent
          className='sm:max-w-md p-0 overflow-hidden'
          showCloseButton={false}
        >
          <DialogHeader className='bg-primary p-4 flex flex-row items-center justify-between'>
            <DialogTitle className='text-[#141b34] text-xl'>
              Add Match
            </DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 hover:bg-primary-light rounded-full border-2 border-red-500'
              onClick={() => {
                setIsAddMatchOpen(false);
                resetForm();
              }}
            >
              <X className='h-5 w-5 text-red-500' />
            </Button>
          </DialogHeader>

          <div className='p-4 pt-0'>
            <div className='grid grid-cols-2 gap-5 mb-4'>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Team A *</label>
                <div className='flex gap-2 mt-1'>
                  <Input
                    placeholder='Name'
                    className='flex-1'
                    value={formData.teamAName}
                    onChange={(e) =>
                      handleInputChange("teamAName", e.target.value)
                    }
                  />
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-9 w-9 bg-transparent'
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload("A", file);
                      };
                      input.click();
                    }}
                  >
                    <Upload size={18} />
                  </Button>
                </div>
                {formData.teamAImage && (
                  <p className='text-sm text-green-600'>
                    Image selected: {formData.teamAImage.name}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Team B *</label>
                <div className='flex gap-2 mt-1'>
                  <Input
                    placeholder='Name'
                    className='flex-1'
                    value={formData.teamBName}
                    onChange={(e) =>
                      handleInputChange("teamBName", e.target.value)
                    }
                  />
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-9 w-9 bg-transparent'
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload("B", file);
                      };
                      input.click();
                    }}
                  >
                    <Upload size={18} />
                  </Button>
                </div>
                {formData.teamBImage && (
                  <p className='text-sm text-green-600'>
                    Image selected: {formData.teamBImage.name}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-5 mb-4'>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Time *</label>
                <div className='relative'>
                  <Clock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    type='time'
                    className='pl-10'
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={formData.date}
                      onSelect={(date) => handleInputChange("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-5 mb-4'>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Status</label>
                <Select
                  value={formData.status || "upcoming"}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='upcoming'>Upcoming</SelectItem>
                    <SelectItem value='live'>Live</SelectItem>
                    <SelectItem value='finished'>Finished</SelectItem>
                    <SelectItem value='voting'>Voting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Winner</label>
                <Select
                  value={formData.winner || "no_winner"}
                  onValueChange={(value) => handleInputChange("winner", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Winner' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='no_winner'>No Winner</SelectItem>
                    <SelectItem value='team_a'>Win Team A</SelectItem>
                    <SelectItem value='team_b'>Win Team B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Goal Difference Field - Now with conditional rendering */}
            {formData.winner && formData.winner !== "no_winner" && (
              <div className='space-y-2 mb-4'>
                <label className='font-medium text-[#141b34]'>
                  Goal Difference
                </label>
                <Input
                  type='number'
                  min='0'
                  step='1'
                  placeholder='Enter goal difference'
                  value={formData.goal_difference?.toString() || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleInputChange("goal_difference", undefined);
                    } else {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue) && numValue >= 0) {
                        handleInputChange("goal_difference", numValue);
                      }
                    }
                  }}
                />
              </div>
            )}

            <div className='space-y-2 mb-4'>
              <label className='font-medium text-[#141b34]'>
                Select Player
              </label>
              <div className='flex gap-2 mt-1'>
                <Select onValueChange={handleAddPlayer}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue
                      placeholder={
                        loadingPlayers ? "Loading players..." : "Select Player"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPlayers ? (
                      <SelectItem value='loading' disabled>
                        Loading players...
                      </SelectItem>
                    ) : availablePlayers.length === 0 ? (
                      <SelectItem value='no-players' disabled>
                        No players available
                      </SelectItem>
                    ) : (
                      availablePlayers.map((player) => (
                        <SelectItem
                          key={player.id}
                          value={player.id}
                          disabled={formData.selectedPlayers.includes(
                            player.id
                          )}
                          className='cursor-pointer'
                        >
                          <div className='flex items-center justify-between w-full min-w-0'>
                            <div className='flex items-center gap-2 flex-1 min-w-0'>
                              <Avatar className='w-6 h-6 flex-shrink-0'>
                                <AvatarImage
                                  src={
                                    getFullImageUrl(player?.image) ||
                                    "/user.png"
                                  }
                                  alt={player.name}
                                  className='w-6 h-6 object-cover'
                                />
                              </Avatar>
                              <span className='truncate'>{player.name}</span>
                            </div>
                            <span className='text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0 ml-2'>
                              {player.jersey}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Players */}
              {formData.selectedPlayers.length > 0 && (
                <div className='mt-3'>
                  <label className='text-sm font-medium text-[#141b34] mb-2 block'>
                    Selected Players ({formData.selectedPlayers.length})
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {formData.selectedPlayers.map((playerId) => {
                      const player = availablePlayers.find(
                        (p) => p.id === playerId
                      );
                      return (
                        <div
                          key={playerId}
                          className='bg-primary/20 text-[#141b34] px-3 py-1 rounded-full text-sm flex items-center gap-2'
                        >
                          <Avatar className='w-5 h-5'>
                            <AvatarImage
                              src={
                                getFullImageUrl(player?.image ?? "") ||
                                "/user.png"
                              }
                              alt={player?.name}
                              className='w-5 h-5 object-cover'
                            />
                          </Avatar>
                          {player?.name}
                          <span className='text-xs bg-white px-1 rounded'>
                            #{player?.jersey}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleRemovePlayer(playerId)}
                            className='text-red-500 hover:text-red-700'
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsAddMatchOpen(false);
                  resetForm();
                }}
                className='hover:bg-gray-200 hover:text-black'
              >
                Cancel
              </Button>
              <Button
                className='bg-primary hover:bg-primary/90 text-[#141b34]'
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Match Dialog */}
      <Dialog open={isEditMatchOpen} onOpenChange={setIsEditMatchOpen}>
        <DialogContent
          className='sm:max-w-md p-0 overflow-hidden'
          showCloseButton={false}
        >
          <DialogHeader className='bg-primary p-4 flex flex-row items-center justify-between'>
            <DialogTitle className='text-[#141b34] text-xl'>
              Edit Match
            </DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 hover:bg-primary-light rounded-full border-2 border-red-500'
              onClick={() => {
                setIsEditMatchOpen(false);
                resetForm();
              }}
            >
              <X className='h-5 w-5 text-red-500' />
            </Button>
          </DialogHeader>

          <div className='p-4 pt-0'>
            <div className='grid grid-cols-2 gap-5 mb-4'>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Team A *</label>
                <div className='flex gap-2 mt-1'>
                  <Input
                    placeholder='Name'
                    className='flex-1'
                    value={formData.teamAName}
                    onChange={(e) =>
                      handleInputChange("teamAName", e.target.value)
                    }
                  />
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-9 w-9 bg-transparent'
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload("A", file);
                      };
                      input.click();
                    }}
                  >
                    <Upload size={18} />
                  </Button>
                </div>
                {formData.teamAImage && (
                  <p className='text-sm text-green-600'>
                    New image selected: {formData.teamAImage.name}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Team B *</label>
                <div className='flex gap-2 mt-1'>
                  <Input
                    placeholder='Name'
                    className='flex-1'
                    value={formData.teamBName}
                    onChange={(e) =>
                      handleInputChange("teamBName", e.target.value)
                    }
                  />
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-9 w-9 bg-transparent'
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload("B", file);
                      };
                      input.click();
                    }}
                  >
                    <Upload size={18} />
                  </Button>
                </div>
                {formData.teamBImage && (
                  <p className='text-sm text-green-600'>
                    New image selected: {formData.teamBImage.name}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-5 mb-4'>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Time *</label>
                <div className='relative'>
                  <Clock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    type='time'
                    className='pl-10'
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={formData.date}
                      onSelect={(date) => handleInputChange("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-5 mb-4'>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Status</label>
                <Select
                  value={formData.status || "upcoming"}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='upcoming'>Upcoming</SelectItem>
                    <SelectItem value='live'>Live</SelectItem>
                    <SelectItem value='finished'>Finished</SelectItem>
                    <SelectItem value='voting'>Voting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Winner</label>
                <Select
                  value={formData.winner || "no_winner"}
                  onValueChange={(value) => handleInputChange("winner", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Winner' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='no_winner'>No Winner</SelectItem>
                    <SelectItem value='team_a'>Win Team A</SelectItem>
                    <SelectItem value='team_b'>Win Team B</SelectItem>
                    <SelectItem value='draw'>Match Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.winner && formData.winner !== "no_winner" && (
              <div className='space-y-2 mb-4'>
                <label className='font-medium text-[#141b34]'>
                  Goal Difference
                </label>
                <Input
                  type='number'
                  min='0'
                  step='1'
                  placeholder='Enter goal difference'
                  value={formData.goal_difference?.toString() || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleInputChange("goal_difference", undefined);
                    } else {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue) && numValue >= 0) {
                        handleInputChange("goal_difference", numValue);
                      }
                    }
                  }}
                />
              </div>
            )}

            <div className='space-y-2 mb-4'>
              <label className='font-medium text-[#141b34]'>
                Select Player
              </label>
              <div className='flex gap-2 mt-1'>
                <Select onValueChange={handleAddPlayer}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue
                      placeholder={
                        loadingPlayers ? "Loading players..." : "Select Player"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPlayers ? (
                      <SelectItem value='loading' disabled>
                        Loading players...
                      </SelectItem>
                    ) : availablePlayers.length === 0 ? (
                      <SelectItem value='no-players' disabled>
                        No players available
                      </SelectItem>
                    ) : (
                      availablePlayers.map((player) => (
                        <SelectItem
                          key={player.id}
                          value={player.id}
                          disabled={formData.selectedPlayers.includes(
                            player.id
                          )}
                          className='cursor-pointer'
                        >
                          <div className='flex items-center justify-between w-full min-w-0'>
                            <div className='flex items-center gap-2 flex-1 min-w-0'>
                              <Avatar className='w-6 h-6 flex-shrink-0'>
                                <AvatarImage
                                  src={
                                    getFullImageUrl(player?.image ?? "") ||
                                    "/user.png"
                                  }
                                  alt={player.name}
                                  className='w-6 h-6 object-cover'
                                />
                              </Avatar>
                              <span className='truncate'>{player.name}</span>
                            </div>
                            <span className='text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0 ml-2'>
                              {player.jersey}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Players */}
              {formData.selectedPlayers.length > 0 && (
                <div className='mt-3'>
                  <label className='text-sm font-medium text-[#141b34] mb-2 block'>
                    Selected Players ({formData.selectedPlayers.length})
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {formData.selectedPlayers.map((playerId) => {
                      const player = availablePlayers.find(
                        (p) => p.id === playerId
                      );
                      return (
                        <div
                          key={playerId}
                          className='bg-primary/20 text-[#141b34] px-3 py-1 rounded-full text-sm flex items-center gap-2'
                        >
                          <Avatar className='w-5 h-5'>
                            <AvatarImage
                              src={
                                getFullImageUrl(player?.image ?? "") ||
                                "/user.png"
                              }
                              alt={player?.name}
                              className='w-5 h-5 object-cover'
                            />
                          </Avatar>
                          {player?.name}
                          <span className='text-xs bg-white px-1 rounded'>
                            #{player?.jersey}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleRemovePlayer(playerId)}
                            className='text-red-500 hover:text-red-700'
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditMatchOpen(false);
                  resetForm();
                }}
                className='hover:bg-gray-200 hover:text-black'
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent
          className='sm:max-w-md p-0 overflow-hidden'
          showCloseButton={false}
        >
          <DialogHeader className='bg-red-500 p-4 flex flex-row items-center justify-between'>
            <DialogTitle className='text-white text-xl'>
              Delete Match
            </DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 hover:bg-red-600 rounded-full'
              onClick={() => {
                setIsDeleteModalOpen(false);
                setMatchToDelete(null);
              }}
            >
              <X className='h-5 w-5 text-white' />
            </Button>
          </DialogHeader>

          <div className='p-6'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center'>
                <Trash2 className='h-6 w-6 text-red-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Are you sure?
                </h3>
                <p className='text-sm text-gray-600'>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {matchToDelete && (
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <p className='text-sm text-gray-600 mb-2'>
                  You are about to delete:
                </p>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    {matchToDelete.team_a_pics ? (
                      <Image
                        className='w-6 h-6 object-contain'
                        alt={`${matchToDelete.team_a} logo`}
                        src={
                          getFullImageUrl(matchToDelete.team_a_pics) ||
                          "/placeholder.svg"
                        }
                        width={24}
                        height={24}
                      />
                    ) : (
                      <div className='w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-xs'>
                        {getTeamInitials(matchToDelete.team_a)}
                      </div>
                    )}
                    <span className='font-medium text-gray-900'>
                      {matchToDelete.team_a}
                    </span>
                  </div>
                  <span className='text-gray-500'>vs</span>
                  <div className='flex items-center gap-2'>
                    {matchToDelete.team_b_pics ? (
                      <Image
                        className='w-6 h-6 object-contain'
                        alt={`${matchToDelete.team_b} logo`}
                        src={
                          getFullImageUrl(matchToDelete.team_b_pics) ||
                          "/placeholder.svg"
                        }
                        width={24}
                        height={24}
                      />
                    ) : (
                      <div className='w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-xs'>
                        {getTeamInitials(matchToDelete.team_b)}
                      </div>
                    )}
                    <span className='font-medium text-gray-900'>
                      {matchToDelete.team_b}
                    </span>
                  </div>
                </div>
                <p className='text-sm text-gray-600 mt-2'>
                  {formatDate(matchToDelete.date)} at{" "}
                  {formatTime(matchToDelete.time)}
                </p>
              </div>
            )}

            <div className='flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setMatchToDelete(null);
                }}
                className='hover:bg-gray-100'
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                Delete Match
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
