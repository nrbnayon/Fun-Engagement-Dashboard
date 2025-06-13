// src/app/(dashboard)/components/MatchesListPage.tsx
"use client";
import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
import { Plus } from "lucide-react";
import { generateMatchesData } from "@/lib/data/matches";

type MatchTab = "all" | "voting" | "live" | "upcoming";

const tabs: { key: MatchTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "voting", label: "Voting" },
  { key: "live", label: "Live Match" },
  { key: "upcoming", label: "Upcoming" },
];

interface MatchesPageProps {
  itemsPerPage?: number;
}

export default function MatchesListPage({
  itemsPerPage = 12,
}: MatchesPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<MatchTab>("all");

  const allMatchesData = generateMatchesData(100);

  const filteredData = allMatchesData;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: MatchTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
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
    <div className='flex flex-col w-full space-y-6'>
      {/* Header with Title and Add Button */}
      <div className='flex items-center justify-between w-full'>
        <h1 className='text-3xl font-bold text-secondary font-oswald'>
          Matches
        </h1>
        <Button className='bg-primary hover:bg-primary/90 text-white'>
          <Plus className='w-4 h-4 mr-2' />
          Add Match
        </Button>
      </div>

      {/* Tabs */}
      <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit'>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "text-muted hover:text-blackblack-800 hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Matches Table */}
      <Card className='w-full rounded-xl overflow-hidden border-border p-0'>
        <CardContent className='p-0'>
          <Table className='border-collapse'>
            <TableHeader className='border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300'>
              <TableRow>
                <TableHead className='font-normal text-secondary pl-8 py-4'>
                  Team A
                </TableHead>
                <TableHead className='font-normal text-secondary pl-6 py-4'>
                  Team B
                </TableHead>
                <TableHead className='font-normal text-center text-secondary py-4'>
                  Time
                </TableHead>
                <TableHead className='font-normal text-center text-secondary py-4'>
                  Date
                </TableHead>
                <TableHead className='font-normal text-center text-secondary py-4'>
                  Players
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='bg-white'>
              {currentData.map((match, index) => (
                <TableRow
                  key={`${match.teamA.name}-${match.teamB.name}-${
                    startIndex + index
                  }`}
                >
                  <TableCell className='px-6 py-4'>
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
                  <TableCell className='px-6 py-4'>
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
                  <TableCell className='px-6 py-4 text-center'>
                    <div className='font-normal text-blackblack-700 text-xl'>
                      {match.time}
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-4 text-center'>
                    <div className='font-normal text-blackblack-700 text-xl'>
                      {match.date}
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-4'>
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center w-full'>
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
