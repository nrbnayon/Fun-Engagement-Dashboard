// src/app/(dashboard)/components/VotingList.tsx
"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getFullImageUrl } from "@/lib/utils";
import { getAllVotings, matchResult } from "@/lib/services/votingDataApi";

// Types based on your API response
interface Player {
  id: number;
  image: string;
  name: string;
  jersey_number: number;
  status: string;
}

interface UserProfile {
  id: number;
  user: number;
  name: string;
  profile_picture: string;
  phone_number: string;
  joined_date: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  is_verified: boolean;
  user_profile: UserProfile;
}

interface VotingData {
  id: number;
  user: User;
  match: number;
  who_will_win: string;
  goal_difference: number;
  selected_players: Player[];
  points_earned: number;
}

interface VotingListProps {
  paginate?: boolean;
  itemsPerPage?: number;
  limit?: number;
  title?: boolean;
}

export default function VotingList({
  paginate = false,
  itemsPerPage = 12,
  limit = 5,
  title = true,
}: VotingListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [votingData, setVotingData] = useState<VotingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWinners, setSelectedWinners] = useState<{
    [key: number]: string;
  }>({});
  const [updatingResults, setUpdatingResults] = useState<{
    [key: number]: boolean;
  }>({});

  // Fetch voting data from API
  useEffect(() => {
    const fetchVotingData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAllVotings();

        if (response.success && Array.isArray(response.data)) {
          setVotingData(response.data);
        } else {
          setError(response.error || "Failed to fetch voting data");
        }
      } catch (err) {
        console.error("Error fetching voting data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchVotingData();
  }, []);

  // Helper function to get team name from who_will_win
  const getTeamName = (whoWillWin: string) => {
    switch (whoWillWin) {
      case "team_a":
        return "Team A";
      case "team_b":
        return "Team B";
      default:
        return whoWillWin;
    }
  };

  // Handle winner selection
  const handleWinnerChange = (matchId: number, winner: string) => {
    setSelectedWinners((prev) => ({
      ...prev,
      [matchId]: winner,
    }));
  };

  // Convert display name to API format
  const getApiFormat = (displayName: string) => {
    switch (displayName) {
      case "Draw / NR":
        return "no_winner";
      case "Team A":
        return "team_a";
      case "Team B":
        return "team_b";
      default:
        return displayName.toLowerCase().replace(" ", "_");
    }
  };

  // Update match result
  const updateMatchResult = async (matchId: number) => {
    const winner = selectedWinners[matchId];
    if (!winner) {
      toast.error("Please select a winner first");
      return;
    }

    setUpdatingResults((prev) => ({
      ...prev,
      [matchId]: true,
    }));

    try {
      // Convert display format to API format
      const apiWinner = getApiFormat(winner);
      const response = await matchResult(matchId, apiWinner);

      if (response.success) {
        toast.success("Match result updated successfully!");
        // Clear the selected winner for this match
        setSelectedWinners((prev) => ({
          ...prev,
          [matchId]: "",
        }));
        // Optionally refresh the data
        const refreshResponse = await getAllVotings();
        if (refreshResponse.success && Array.isArray(refreshResponse.data)) {
          setVotingData(refreshResponse.data);
        }
      } else {
        toast.error(`Failed to update match result: ${response.error}`);
      }
    } catch (error) {
      console.error("Error updating match result:", error);
      toast.error("An error occurred while updating the match result");
    } finally {
      setUpdatingResults((prev) => ({
        ...prev,
        [matchId]: false,
      }));
    }
  };

  // Determine data to show
  const dataToShow = paginate ? votingData : votingData.slice(0, limit);

  // Calculate pagination
  const totalPages = paginate ? Math.ceil(votingData.length / itemsPerPage) : 1;
  const startIndex = paginate ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = paginate ? startIndex + itemsPerPage : dataToShow.length;
  const currentData = paginate
    ? votingData.slice(startIndex, endIndex)
    : dataToShow;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
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
    <main className="flex flex-col w-full items-center">
      {/* Voting Section */}
      <div className="flex flex-col items-start gap-5 w-full">
        <div className="flex items-center justify-between w-full font-oswald">
          {title && (
            <h1 className="text-2xl font-bold text-secondary font-oswald">
              Voting
            </h1>
          )}
          {!paginate && (
            <Link
              href="/voting"
              className="text-secondary text-base tracking-[0] leading-[normal]"
            >
              See All
            </Link>
          )}
        </div>

        <Card className="w-full min-h-74 rounded-xl overflow-hidden border-border p-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="border-collapse min-w-5xl">
                <TableHeader className="border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300">
                  <TableRow>
                    <TableHead className="font-normal text-secondary pl-6 py-4 min-w-56">
                      User
                    </TableHead>
                    <TableHead className="font-normal text-secondary pl-5 py-4 min-w-56">
                      Email
                    </TableHead>
                    <TableHead className="font-normal text-secondary pl-5 py-4 min-w-44">
                      Who Will Win
                    </TableHead>
                    <TableHead className="font-normal text-center text-secondary py-4 min-w-24">
                      Goals
                    </TableHead>
                    <TableHead className="font-normal text-center text-secondary py-4 min-w-60">
                      Select Player
                    </TableHead>
                    {/* <TableHead className="font-normal text-center text-secondary py-4 min-w-64">
                      Update Match Result
                    </TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="font-normal text-blackblack-700 text-xl">
                          Loading voting data...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="font-normal text-red-500 text-xl">
                          Error: {error}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : currentData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="font-normal text-blackblack-700 text-xl">
                          No voting data available
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="px-6 py-3 min-w-56">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                className="w-10 h-10 object-cover rounded-full"
                                alt="User avatar"
                                src={
                                  getFullImageUrl(
                                    item.user.user_profile.profile_picture
                                  ) || "/user.png"
                                }
                              />
                            </Avatar>
                            <span className="font-normal text-blackblack-700 text-xl">
                              {item.user.user_profile.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3 min-w-56">
                          <div className="font-normal text-blackblack-700 text-xl">
                            {item.user.email}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3 min-w-44">
                          <div className="font-normal text-blackblack-700 text-xl">
                            {getTeamName(item.who_will_win)}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-center min-w-24">
                          <div className="font-normal text-blackblack-700 text-xl">
                            {item.goal_difference}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3 min-w-60">
                          <div className="flex items-center justify-center gap-2">
                            {item.selected_players.length > 0 ? (
                              item.selected_players.map(
                                (player: Player, idx: number) => (
                                  <Badge
                                    key={player.id || idx}
                                    className="flex items-center justify-center px-3 w-10 h-10 tex-xs bg-white rounded-full border border-solid border-[#fbf2c5] font-mono text-secondary text-lg"
                                    title={player.name}
                                  >
                                    {player.jersey_number}
                                  </Badge>
                                )
                              )
                            ) : (
                              <span className="font-normal text-gray-500 text-sm">
                                No players selected
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {/* <TableCell className="px-6 py-3 min-w-64">
                          <div className="flex items-center gap-2">
                            <Select
                              value={selectedWinners[item.match] || ""}
                              onValueChange={(value) =>
                                handleWinnerChange(item.match, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select winner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Draw / NR">
                                  Draw / NR
                                </SelectItem>
                                <SelectItem value="Team A">
                                  Win Team A
                                </SelectItem>
                                <SelectItem value="Team B">
                                  Win Team B
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={() => updateMatchResult(item.match)}
                              disabled={
                                !selectedWinners[item.match] ||
                                updatingResults[item.match]
                              }
                              className="px-3 py-2 text-sm bg-primary hover:bg-primary/90 text-white"
                            >
                              {updatingResults[item.match]
                                ? "Updating..."
                                : "Update"}
                            </Button>
                          </div>
                        </TableCell> */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {paginate && totalPages > 1 && !loading && !error && (
          <div className="flex justify-center w-full mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
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
      </div>
    </main>
  );
}
