// src/app/(dashboard)/components/VotingList.tsx
"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getFullImageUrl } from "@/lib/utils";
import { getAllVotings, matchResult } from "@/lib/services/votingDataApi";
import { getAllMatch } from "@/lib/services/matchDataApi";

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

interface Match {
  id: number;
  date: string;
  selected_players: Player[];
  status: string;
  team_a: string;
  team_b: string;
  team_a_pics?: string;
  team_b_pics?: string;
  time: string;
  win_name?: string;
  winner?: string;
}

interface VotingListProps {
  paginate?: boolean;
  itemsPerPage?: number;
  limit?: number;
  title?: boolean;
}

// Helper function to get team name initials
const getTeamInitials = (teamName: string): string => {
  const words = teamName.trim().split(/\s+/);
  if (words.length >= 2) {
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }
  return (
    teamName.charAt(0).toUpperCase() + (teamName.charAt(1) || "").toUpperCase()
  );
};

export default function VotingList({
  paginate = false,
  itemsPerPage = 12,
  limit = 5,
  title = true,
}: VotingListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [votingData, setVotingData] = useState<VotingData[]>([]);
  const [matchesData, setMatchesData] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWinners, setSelectedWinners] = useState<{
    [key: number]: string;
  }>({});
  const [updatingResults, setUpdatingResults] = useState<{
    [key: number]: boolean;
  }>({});

  // Fetch voting data and match data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [votingResponse, matchResponse] = await Promise.all([
          getAllVotings(),
          getAllMatch(),
        ]);

        if (votingResponse.success && Array.isArray(votingResponse.data)) {
          // console.log("Live Match voting::", votingResponse.data);
          setVotingData(votingResponse.data);
        } else {
          setError(votingResponse.error || "Failed to fetch voting data");
        }

        if (matchResponse.success && Array.isArray(matchResponse.data)) {
          setMatchesData(matchResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get match data by match ID
  const getMatchData = (matchId: number): Match | null => {
    return matchesData.find((match) => match.id === matchId) || null;
  };

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
        const [refreshVotingResponse, refreshMatchResponse] = await Promise.all(
          [getAllVotings(), getAllMatch()]
        );

        if (
          refreshVotingResponse.success &&
          Array.isArray(refreshVotingResponse.data)
        ) {
          setVotingData(refreshVotingResponse.data);
        }

        if (
          refreshMatchResponse.success &&
          Array.isArray(refreshMatchResponse.data)
        ) {
          setMatchesData(refreshMatchResponse.data);
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
              <Table className="border-collapse min-w-3xl">
                <TableHeader className="border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300">
                  <TableRow>
                    <TableHead className="font-normal text-secondary pl-6 py-4 min-w-32">
                      User
                    </TableHead>
                    <TableHead className="font-normal text-secondary pl-5 py-4 min-w-32">
                      Email
                    </TableHead>
                    <TableHead className="font-normal text-secondary pl-5 py-4 min-w-24">
                      Match #
                    </TableHead>
                    <TableHead className="font-normal text-secondary pl-5 py-4 min-w-60">
                      Match Details
                    </TableHead>
                    <TableHead className="font-normal text-secondary pl-5 py-4 min-w-28">
                      Who Will Win
                    </TableHead>
                    <TableHead className="font-normal text-center text-secondary py-4 min-w-24">
                      Goals
                    </TableHead>
                    <TableHead className="font-normal text-center text-secondary py-4 min-w-40">
                      Select Player
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="font-normal text-blackblack-700 text-xl">
                          Loading voting data...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="font-normal text-red-500 text-xl">
                          Error: {error}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : currentData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="font-normal text-blackblack-700 text-xl">
                          No voting data available
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((item, index) => {
                      const matchData = getMatchData(item.match);
                      return (
                        <TableRow key={item.id || index}>
                          <TableCell className="px-6 py-3 min-w-32">
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
                          <TableCell className="px-6 py-3 min-w-32">
                            <div className="font-normal text-blackblack-700 text-xl">
                              {item.user.email}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 min-w-24">
                            <div className="font-normal text-blackblack-700 text-xl">
                              #{item.match}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 min-w-60">
                            {matchData ? (
                              <div className="flex items-center gap-4">
                                {/* Team A */}
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    {matchData.team_a_pics ? (
                                      <AvatarImage
                                        className="w-8 h-8 object-cover rounded"
                                        alt={`${matchData.team_a} logo`}
                                        src={getFullImageUrl(
                                          matchData.team_a_pics
                                        )}
                                      />
                                    ) : (
                                      <AvatarFallback className="w-8 h-8 text-xs font-semibold">
                                        {getTeamInitials(matchData.team_a)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <span className="font-normal text-blackblack-700 text-sm">
                                    {matchData.team_a}
                                  </span>
                                </div>

                                {/* VS */}
                                <span className="font-bold text-gray-500 text-sm">
                                  VS
                                </span>

                                {/* Team B */}
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    {matchData.team_b_pics ? (
                                      <AvatarImage
                                        className="w-8 h-8 object-cover rounded"
                                        alt={`${matchData.team_b} logo`}
                                        src={getFullImageUrl(
                                          matchData.team_b_pics
                                        )}
                                      />
                                    ) : (
                                      <AvatarFallback className="w-8 h-8 text-xs font-semibold">
                                        {getTeamInitials(matchData.team_b)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <span className="font-normal text-blackblack-700 text-sm">
                                    {matchData.team_b}
                                  </span>
                                </div>

                                {/* Status Badge */}
                                <Badge
                                  className={`text-xs px-2 py-1 ${
                                    matchData.status === "live"
                                      ? "bg-red-100 text-red-700 border-red-300"
                                      : matchData.status === "upcoming"
                                      ? "bg-blue-500 text-white border-blue-300 "
                                      : "bg-gray-100 text-gray-700 border-gray-300"
                                  }`}
                                >
                                  {matchData.status.charAt(0).toUpperCase() +
                                    matchData.status.slice(1)}
                                </Badge>
                              </div>
                            ) : (
                              <div className="font-normal text-gray-500 text-sm">
                                Match data not available
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-3 min-w-28">
                            <div className="font-normal text-blackblack-700 text-xl">
                              {getTeamName(item.who_will_win)}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-center min-w-24">
                            <div className="font-normal text-blackblack-700 text-xl">
                              {item.goal_difference}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 min-w-40">
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
                        </TableRow>
                      );
                    })
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
