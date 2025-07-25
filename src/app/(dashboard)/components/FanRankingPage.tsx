// src\app\(dashboard)\components\FanRankingPage.tsx
"use client";
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
import apiEndpoint from "@/lib/axios";

// Updated interface to match API response structure
interface FanRankingData {
  rank: number;
  name: string;
  email: string;
  points: number;
}

interface FanRankingListProps {
  paginate?: boolean;
  itemsPerPage?: number;
  limit?: number;
  title?: boolean;
}

export default function FanRankingPage({
  paginate = false,
  itemsPerPage = 12,
  limit = 5,
  title = true,
}: FanRankingListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fanRankingData, setFanRankingData] = useState<FanRankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchFanRankingData = async () => {
      try {
        setLoading(true);
        const response = await apiEndpoint.get("/fans/leaderboard/");

        // Define the expected API response item type
        type ApiFanRankingItem = {
          rank: number;
          points: number;
          user: {
            email: string;
            user_profile: {
              name: string;
            };
          };
        };

        // Transform API data to match component structure
        const transformedData: FanRankingData[] = response.data.map(
          (item: ApiFanRankingItem) => ({
            rank: item.rank,
            name: item.user.user_profile.name,
            email: item.user.email,
            points: item.points,
          })
        );

        setFanRankingData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching fan ranking data:", err);
        setError("Failed to load fan ranking data");
      } finally {
        setLoading(false);
      }
    };

    fetchFanRankingData();
  }, []);

  // Function to convert rank number to ordinal (1st, 2nd, 3rd, etc.)
  const getOrdinalRank = (rank: number): string => {
    const suffix = ["th", "st", "nd", "rd"];
    const v = rank % 100;
    return rank + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  };

  // Determine data to show
  const dataToShow = paginate ? fanRankingData : fanRankingData.slice(0, limit);

  // Calculate pagination
  const totalPages = paginate
    ? Math.ceil(fanRankingData.length / itemsPerPage)
    : 1;
  const startIndex = paginate ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = paginate ? startIndex + itemsPerPage : dataToShow.length;
  const currentData = paginate
    ? fanRankingData.slice(startIndex, endIndex)
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

  // Loading state
  if (loading) {
    return (
      <main className="flex flex-col w-full items-center">
        <div className="flex flex-col items-start gap-5 w-full">
          {title && (
            <h1 className="text-2xl font-bold text-secondary font-oswald">
              Fan Ranking
            </h1>
          )}
          <Card className="w-full min-h-74 rounded-xl overflow-hidden border-border p-0">
            <CardContent className="p-6">
              <div className="flex justify-center items-center h-32">
                <div className="text-lg text-secondary">
                  Loading fan rankings...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex flex-col w-full items-center">
        <div className="flex flex-col items-start gap-5 w-full">
          {title && (
            <h1 className="text-2xl font-bold text-secondary font-oswald">
              Fan Ranking
            </h1>
          )}
          <Card className="w-full min-h-74 rounded-xl overflow-hidden border-border p-0">
            <CardContent className="p-6">
              <div className="flex justify-center items-center h-32">
                <div className="text-lg text-red-500">{error}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full items-center">
      {/* Fan Ranking Section */}
      <div className="flex flex-col items-start gap-5 w-full">
        <div className="flex items-center justify-between w-full font-oswald">
          {title && (
            <h1 className="text-2xl font-bold text-secondary font-oswald">
              Fan Ranking
            </h1>
          )}
          {!paginate && (
            <Link
              href="/fan-ranking"
              className="text-secondary text-base tracking-[0] leading-[normal]"
            >
              See All
            </Link>
          )}
        </div>

        <Card className="w-full min-h-74 rounded-xl overflow-hidden border-border p-0">
          <CardContent className="p-0">
            <Table className="border-collapse">
              <TableHeader className="border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300">
                <TableRow>
                  <TableHead className="font-normal text-secondary pl-6 py-4">
                    Rank
                  </TableHead>
                  <TableHead className="font-normal text-secondary pl-6 py-4">
                    User
                  </TableHead>
                  <TableHead className="font-normal text-secondary pl-6 py-4">
                    Email
                  </TableHead>
                  <TableHead className="font-normal text-center text-secondary py-4">
                    Points
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {currentData.length > 0 ? (
                  currentData.map((fanRank, index) => (
                    <TableRow key={`${fanRank.rank}-${index}`}>
                      <TableCell className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Badge className="flex items-center justify-center px-3 w-10 h-10 bg-white rounded-full border border-solid border-border font-oswald text-md text-secondary">
                            {getOrdinalRank(fanRank.rank)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-3">
                        <div className="font-normal text-blackblack-700 text-xl">
                          {fanRank.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-3">
                        <div className="font-normal text-blackblack-700 text-xl">
                          {fanRank.email}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-3 text-center">
                        <div className="font-normal text-blackblack-700 text-xl">
                          {fanRank.points} Pts
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-8 text-center">
                      <div className="text-lg text-secondary">
                        No fan ranking data available
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {paginate && totalPages > 1 && (
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
