// src/app/(dashboard)/components/MatchesOverview.tsx
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
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getFullImageUrl } from "@/lib/utils";
import { getAllMatch } from "@/lib/services/matchDataApi";

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
  time: string;
  date: string;
  status: string;
  selected_players: Player[];
  win_name: string | null;
  winner: string | null;
}

interface MatchesOverviewProps {
  limit?: number;
  paginate?: boolean;
  itemsPerPage?: number;
  title?: boolean;
}

export default function MatchesOverview({
  limit = 5,
  paginate = false,
  itemsPerPage = 12,
  title = true,
}: MatchesOverviewProps) {
  const [allMatchesData, setAllMatchesData] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch matches data from API
  useEffect(() => {
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

    fetchMatchesData();
  }, []);

  // Helper function to get team logo (you can customize this based on your team logos)
  const getTeamLogo = (teamName: string) => {
    const teamLogos: { [key: string]: string } = {
      Barcalona: "/clubcrest--2--1-1.png",
      Barcelona: "/clubcrest--2--1-1.png",
      "Rial Madrid": "/logo.png",
      "Real Madrid": "/logo.png",
      "Lister City": "/stowhy8qeoz7mplxkp2kc-1-1.png",
      "Leicester City": "/stowhy8qeoz7mplxkp2kc-1-1.png",
      "Inter Miami": "/logo.png",
      Manchester: "/stowhy8qeoz7mplxkp2kc-1-1.png",
      Chelsea: "/logo.png",
    };

    return teamLogos[teamName] || "/logo.png";
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour24 = parseInt(hours);
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

  // Determine data to show based on pagination and limit
  const dataToShow = paginate ? allMatchesData : allMatchesData.slice(0, limit);

  // Calculate pagination
  const totalPages = paginate
    ? Math.ceil(allMatchesData.length / itemsPerPage)
    : 1;
  const startIndex = paginate ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = paginate ? startIndex + itemsPerPage : dataToShow.length;
  const currentData = paginate
    ? allMatchesData.slice(startIndex, endIndex)
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
    <div className="flex flex-col items-start gap-5 w-full">
      <div className="flex items-center justify-between w-full font-oswald">
        {title && <h2 className="text-2xl text-secondary">Matches List</h2>}
        {!paginate && (
          <Link
            href="/matches"
            className="text-secondary text-base tracking-[0] leading-[normal] hover:underline"
          >
            See All
          </Link>
        )}
      </div>

      <Card className="w-full min-h-74 rounded-xl overflow-hidden border-border p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border-collapse min-w-5xl">
              <TableHeader className="border-b-2 border-primary text-xl py-4 md:text-2xl bg-card dark:bg-yellow-300 hover:bg-yellow-300">
                <TableRow>
                  <TableHead className="font-normal text-secondary pl-8 py-4 min-w-40">
                    Team A
                  </TableHead>
                  <TableHead className="font-normal text-secondary pl-6 py-4 min-w-40">
                    Team B
                  </TableHead>
                  <TableHead className="font-normal text-center text-secondary py-4 min-w-24">
                    Time
                  </TableHead>
                  <TableHead className="font-normal text-center text-secondary py-4 min-w-28">
                    Date
                  </TableHead>
                  <TableHead className="font-normal text-center text-secondary py-4 min-w-48">
                    Players
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="font-normal text-blackblack-700 text-xl">
                        Loading matches...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="font-normal text-red-500 text-xl">
                        Error: {error}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="font-normal text-blackblack-700 text-xl">
                        No matches available
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((match, index) => (
                    <TableRow key={match.id || index}>
                      <TableCell className="px-6 py-4 min-w-40">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <Image
                              className="w-9 h-9 object-contain"
                              alt={`${match.team_a} logo`}
                              src={getTeamLogo(match.team_a)}
                              width={36}
                              height={36}
                            />
                          </div>
                          <span className="font-normal text-blackblack-700 text-xl">
                            {match.team_a}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 min-w-40">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <Image
                              className="w-9 h-9 object-contain"
                              alt={`${match.team_b} logo`}
                              src={getTeamLogo(match.team_b)}
                              width={36}
                              height={36}
                            />
                          </div>
                          <span className="font-normal text-blackblack-700 text-xl">
                            {match.team_b}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center min-w-24">
                        <div className="font-normal text-blackblack-700 text-xl">
                          {formatTime(match.time)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center min-w-28">
                        <div className="font-normal text-blackblack-700 text-xl">
                          {formatDate(match.date)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 min-w-48">
                        <div className="flex items-center justify-center">
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
                                    className="w-10 h-10 object-cover rounded-full border-2 border-border"
                                    alt={player.name}
                                    src={
                                      getFullImageUrl(player.image) ||
                                      "/ellipse-2-7.png"
                                    }
                                  />
                                </Avatar>
                              ))
                          ) : (
                            <span className="font-normal text-gray-500 text-sm">
                              No players selected
                            </span>
                          )}
                        </div>
                      </TableCell>
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
        <div className="flex justify-center w-full mt-4">
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
    </div>
  );
}
