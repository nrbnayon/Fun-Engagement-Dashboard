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
import { Plus, Upload, X } from "lucide-react";
import { generateMatchesData, Match } from "@/lib/data/matches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import VotingList from "./VotingList";
import LiveMatches from "./LiveMatches";
import UpcomingMatches from "./UpcomingMatches";

interface MatchesPageProps {
  itemsPerPage?: number;
}

interface FormData {
  teamAName: string;
  teamBName: string;
  time: string;
  date: string;
  selectedPlayers: string[];
  winner?: string;
  goal_difference?: number;
}

const availablePlayers = [
  {
    id: "player1",
    name: "Kristin Watson",
    jersey: "11",
    image: "/ellipse-2-7.png",
  },
  {
    id: "player2",
    name: "Robert Fox",
    jersey: "10",
    image: "/ellipse-2-7.png",
  },
  {
    id: "player3",
    name: "Bessie Cooper",
    jersey: "9",
    image: "/ellipse-2-7.png",
  },
  {
    id: "player4",
    name: "Annette Black",
    jersey: "300",
    image: "/ellipse-2-7.png",
  },
  {
    id: "player5",
    name: "Devon Lane",
    jersey: "15",
    image: "/ellipse-2-7.png",
  },
  {
    id: "player6",
    name: "Ralph Edwards",
    jersey: "3",
    image: "/ellipse-2-7.png",
  },
  {
    id: "player7",
    name: "Courtney Henry",
    jersey: "7",
    image: "/ellipse-2-7.png",
  },
  {
    id: "player8",
    name: "Savannah Nguyen",
    jersey: "21",
    image: "/ellipse-2-7.png",
  },
];

export default function MatchesListPage({
  itemsPerPage = 12,
}: MatchesPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>(() =>
    generateMatchesData(100)
  );

  // Form state
  const [formData, setFormData] = useState<FormData>({
    teamAName: "",
    teamBName: "",
    time: "",
    date: "",
    selectedPlayers: [],
  });

  const filteredData = matches;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddPlayer = (playerId: string) => {
    const player = availablePlayers.find((p) => p.id === playerId);
    if (player && !formData.selectedPlayers.includes(playerId)) {
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

  const resetForm = () => {
    setFormData({
      teamAName: "",
      teamBName: "",
      time: "",
      date: "",
      selectedPlayers: [],
    });
  };

  const handleSubmit = () => {
    // Validate form
    if (
      !formData.teamAName ||
      !formData.teamBName ||
      !formData.time ||
      !formData.date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new match
    const newMatch: Match = {
      teamA: {
        name: formData.teamAName,
        logo: "/logo.png",
      },
      teamB: {
        name: formData.teamBName,
        logo: "/logo.png",
      },
      time: formData.time,
      date: formData.date,
      players: Array(16).fill("/ellipse-2-7.png"),
      status: "upcoming",
    };

    // Add to matches list
    setMatches((prev) => [newMatch, ...prev]);

    // Reset form and close modal
    resetForm();
    setIsAddMatchOpen(false);

    // Show success toast
    toast.success("Match added successfully!");
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
        <h1 className='text-2xl font-bold text-secondary font-oswald'>
          Matches
        </h1>
        <Button
          className='bg-primary hover:bg-primary/90 text-black'
          onClick={() => setIsAddMatchOpen(true)}
        >
          <Plus size={18} />
          Add Match
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='all' className='mb-6'>
        <TabsList className='bg-transparent border-b border-gray-200 font-oswald justify-start gap-2 h-auto p-0'>
          <TabsTrigger
            value='all'
            className='rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2'
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value='voting'
            className='rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2'
          >
            Voting
          </TabsTrigger>
          <TabsTrigger
            value='live'
            className='rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2'
          >
            Live Match
          </TabsTrigger>
          <TabsTrigger
            value='upcoming'
            className='rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2'
          >
            Upcoming
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='mt-2'>
          {/* Matches Table */}
          <Card className='w-full rounded-xl overflow-hidden border-border p-0'>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table className='border-collapse min-w-3xl'>
                  <TableHeader className='border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300 dark:bg-yellow-300'>
                    <TableRow>
                      <TableHead className='font-normal text-secondary pl-8 py-4 min-w-40'>
                        Team A
                      </TableHead>
                      <TableHead className='font-normal text-secondary pl-6 py-4 min-w-40'>
                        Team B
                      </TableHead>
                      <TableHead className='font-normal text-center text-secondary py-4 min-w-24'>
                        Time
                      </TableHead>
                      <TableHead className='font-normal text-center text-secondary py-4 min-w-28'>
                        Date
                      </TableHead>
                      <TableHead className='font-normal text-center text-secondary py-4 min-w-48'>
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
                        <TableCell className='px-6 py-4 min-w-40'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 flex items-center justify-center flex-shrink-0'>
                              <Image
                                className='w-9 h-9 object-contain'
                                alt={`${match.teamA.name} logo`}
                                src={match.teamA.logo}
                                width={36}
                                height={36}
                              />
                            </div>
                            <span className='font-normal text-blackblack-700 text-xl whitespace-nowrap'>
                              {match.teamA.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-4 min-w-40'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 flex items-center justify-center flex-shrink-0'>
                              <Image
                                className='w-9 h-9 object-contain'
                                alt={`${match.teamB.name} logo`}
                                src={match.teamB.logo}
                                width={36}
                                height={36}
                              />
                            </div>
                            <span className='font-normal text-blackblack-700 text-xl whitespace-nowrap'>
                              {match.teamB.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-4 text-center min-w-24'>
                          <div className='font-normal text-blackblack-700 text-xl whitespace-nowrap'>
                            {match.time}
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-4 text-center min-w-28'>
                          <div className='font-normal text-blackblack-700 text-xl whitespace-nowrap'>
                            {match.date}
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-4 min-w-48'>
                          <div className='flex items-center justify-center'>
                            {match.players
                              .slice(0, 8)
                              .map((player: string, idx: number) => (
                                <Avatar
                                  key={idx}
                                  className={`${
                                    idx > 0 ? "-ml-2" : ""
                                  } relative z-10 flex-shrink-0`}
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
        </TabsContent>

        <TabsContent value='voting'>
          <VotingList paginate={true} itemsPerPage={12} title={false} />
        </TabsContent>

        <TabsContent value='live' className='mt-2'>
          <LiveMatches matches={matches} itemsPerPage={itemsPerPage} />
        </TabsContent>

        <TabsContent value='upcoming' className='mt-2'>
          <UpcomingMatches matches={matches} itemsPerPage={itemsPerPage} />
        </TabsContent>
      </Tabs>

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
                  <Button variant='outline' size='icon' className='h-9 w-9'>
                    <Upload size={18} />
                  </Button>
                </div>
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
                  <Button variant='outline' size='icon' className='h-9 w-9'>
                    <Upload size={18} />
                  </Button>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-5 mb-4'>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Time *</label>
                <Input
                  placeholder='hrs:min (e.g., 5:00 PM)'
                  className='mt-1'
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <label className='font-medium text-[#141b34]'>Date *</label>
                <Input
                  placeholder='dd/mm/yyyy'
                  className='mt-1'
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
            </div>

            <div className='space-y-2 mb-4'>
              <label className='font-medium text-[#141b34]'>
                Select Player
              </label>
              <div className='flex gap-2 mt-1'>
                <Select onValueChange={handleAddPlayer}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue placeholder='Select Player' />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlayers.map((player) => (
                      <SelectItem
                        key={player.id}
                        value={player.id}
                        disabled={formData.selectedPlayers.includes(player.id)}
                        className='cursor-pointer'
                      >
                        <div className='flex items-center justify-between w-full min-w-0'>
                          <div className='flex items-center gap-2 flex-1 min-w-0'>
                            <Avatar className='w-6 h-6 flex-shrink-0'>
                              <AvatarImage
                                src={player.image}
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
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal Difference Section - Only show if winner is selected */}
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
                              src={player?.image}
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
    </div>
  );
}
