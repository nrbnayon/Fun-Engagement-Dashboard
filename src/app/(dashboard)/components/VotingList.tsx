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
import Link from "next/link";
import { useState } from "react";

// Generate more voting data for demonstration
const generateVotingData = (count: number) => {
  const names = [
    "Kristin Watson",
    "John Doe",
    "Jane Smith",
    "Michael Brown",
    "Sarah Wilson",
    "David Johnson",
    "Emily Davis",
    "Robert Miller",
    "Lisa Anderson",
    "James Wilson",
    "Maria Garcia",
    "William Taylor",
    "Jennifer Thomas",
    "Charles Jackson",
    "Patricia White",
  ];

  const emails = [
    "kristinwatson@gmail.com",
    "john.doe@gmail.com",
    "jane.smith@gmail.com",
    "michael.brown@gmail.com",
    "sarah.wilson@gmail.com",
    "david.johnson@gmail.com",
    "emily.davis@gmail.com",
    "robert.miller@gmail.com",
    "lisa.anderson@gmail.com",
    "james.wilson@gmail.com",
    "maria.garcia@gmail.com",
    "william.taylor@gmail.com",
    "jennifer.thomas@gmail.com",
    "charles.jackson@gmail.com",
    "patricia.white@gmail.com",
  ];

  const teams = [
    "Dumbarton",
    "Manchester",
    "Real Madrid",
    "Barcelona",
    "Chelsea",
  ];

  return Array.from({ length: count }, (_, index) => ({
    user: {
      name: names[index % names.length],
      avatar: "/ellipse-12-7.png",
    },
    email: emails[index % emails.length],
    team: teams[index % teams.length],
    goals: String(Math.floor(Math.random() * 5) + 1),
    players: Array.from({ length: 3 }, () =>
      String(Math.floor(Math.random() * 99) + 1)
    ),
  }));
};

const allVotingData = generateVotingData(50);

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

  // Determine data to show
  const dataToShow = paginate ? allVotingData : allVotingData.slice(0, limit);

  // Calculate pagination
  const totalPages = paginate
    ? Math.ceil(allVotingData.length / itemsPerPage)
    : 1;
  const startIndex = paginate ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = paginate ? startIndex + itemsPerPage : dataToShow.length;
  const currentData = paginate
    ? allVotingData.slice(startIndex, endIndex)
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
    <main className='flex flex-col w-full items-center'>
      {/* Voting Section */}
      <div className='flex flex-col items-start gap-5 w-full'>
        <div className='flex items-center justify-between w-full font-oswald'>
          {title && <h2 className='text-2xl text-secondary'>Voting</h2>}
          {!paginate && (
            <Link
              href='voting'
              className='text-secondary text-base tracking-[0] leading-[normal]'
            >
              See All
            </Link>
          )}
        </div>

        <Card className='w-full min-h-74 rounded-xl overflow-hidden border-border p-0'>
          <CardContent className='p-0'>
            <Table className='border-collapse'>
              <TableHeader className='border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300'>
                <TableRow>
                  <TableHead className='font-normal text-secondary pl-8 py-4'>
                    User
                  </TableHead>
                  <TableHead className='font-normal text-secondary pl-6 py-4'>
                    Email
                  </TableHead>
                  <TableHead className='font-normal text-secondary pl-6 py-4'>
                    Who will Win
                  </TableHead>
                  <TableHead className='font-normal text-center text-secondary py-4'>
                    Goals
                  </TableHead>
                  <TableHead className='font-normal text-center text-secondary py-4'>
                    Select Player
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='bg-white'>
                {currentData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className='px-6 py-3'>
                      <div className='flex items-center gap-3'>
                        <Avatar>
                          <AvatarImage
                            className='w-10 h-10 object-cover rounded-full'
                            alt='User avatar'
                            src={item.user.avatar}
                          />
                        </Avatar>
                        <span className='font-normal text-blackblack-700 text-xl'>
                          {item.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-3'>
                      <div className='font-normal text-blackblack-700 text-xl'>
                        {item.email}
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-3'>
                      <div className='font-normal text-blackblack-700 text-xl'>
                        {item.team}
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-3 text-center'>
                      <div className='font-normal text-blackblack-700 text-xl'>
                        {item.goals}
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-3'>
                      <div className='flex items-center justify-center gap-2'>
                        {item.players.map((player: string, idx: number) => (
                          <Badge
                            key={idx}
                            className='flex items-center justify-center px-3 w-12 h-12 bg-white rounded-full border border-solid border-[#fbf2c5] font-mono text-secondary text-lg'
                          >
                            {player}
                          </Badge>
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
        {paginate && totalPages > 1 && (
          <div className='flex justify-center w-full mt-4'>
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
    </main>
  );
}
