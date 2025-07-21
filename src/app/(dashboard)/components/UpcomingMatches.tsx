// src/app/(dashboard)/components/UpcomingMatches.tsx
"use client";
import { useState } from "react";
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
import { Match } from "@/lib/data/matches";

interface UpcomingMatchesProps {
  matches: Match[];
  itemsPerPage?: number;
}

export default function UpcomingMatches({
  matches,
  itemsPerPage = 12,
}: UpcomingMatchesProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter only upcoming matches
  const upcomingMatches = matches.filter(
    (match) => match.status === "upcoming"
  );

  const totalPages = Math.ceil(upcomingMatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = upcomingMatches.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

  if (upcomingMatches.length === 0) {
    return (
      <div className='text-center p-8 text-gray-500'>
        No upcoming matches available
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Upcoming Matches Table */}
      <Card className='w-full rounded-xl overflow-hidden border-border p-0'>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table className='border-collapse min-w-3xl'>
              <TableHeader className='border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300'>
                <TableRow>
                  <TableHead className='font-normal text-secondary pl-8 py-4 min-w-48'>
                    Team A
                  </TableHead>
                  <TableHead className='font-normal text-secondary pl-6 py-4 min-w-48'>
                    Team B
                  </TableHead>
                  <TableHead className='font-normal text-center text-secondary py-4 min-w-28'>
                    Time
                  </TableHead>
                  <TableHead className='font-normal text-center text-secondary py-4 min-w-32'>
                    Date
                  </TableHead>
                  <TableHead className='font-normal text-center text-secondary py-4 min-w-32'>
                    Status
                  </TableHead>
                  <TableHead className='font-normal text-center text-secondary py-4 min-w-3xs'>
                    Players
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='bg-white'>
                {currentData.map((match, index) => (
                  <TableRow
                    key={`upcoming-${match.teamA.name}-${match.teamB.name}-${
                      startIndex + index
                    }`}
                  >
                    <TableCell className='px-6 py-4 min-w-48'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 flex items-center justify-center'>
                          <Image
                            className='w-9 h-9 object-contain'
                            alt={`${match.teamA.name} logo`}
                            src={match.teamA.logo}
                            width={36}
                            height={36}
                          />
                        </div>
                        <span className='font-normal text-blackblack-700 text-xl'>
                          {match.teamA.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 min-w-48'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 flex items-center justify-center'>
                          <Image
                            className='w-9 h-9 object-contain'
                            alt={`${match.teamB.name} logo`}
                            src={match.teamB.logo}
                            width={36}
                            height={36}
                          />
                        </div>
                        <span className='font-normal text-blackblack-700 text-xl'>
                          {match.teamB.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 text-center min-w-28'>
                      <div className='font-normal text-blackblack-700 text-xl'>
                        {match.time}
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 text-center min-w-32'>
                      <div className='font-normal text-blackblack-700 text-xl'>
                        {match.date}
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 text-center min-w-32'>
                      <div className='font-normal text-blue-500 text-xl capitalize'>
                        📅 Upcoming
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 min-w-3xs'>
                      <div className='flex items-center justify-center'>
                        {match.players
                          .slice(0, 8)
                          .map((player: string, idx: number) => (
                            <Avatar
                              key={idx}
                              className={`${
                                idx > 0 ? "-ml-2" : ""
                              } relative z-10`}
                            >
                              <AvatarImage
                                className='w-10 h-10 object-cover rounded-full border-2 border-border'
                                alt={`Player ${idx + 1}`}
                                src={player}
                              />
                            </Avatar>
                          ))}
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
    </div>
  );
}
