// src\app\(dashboard)\components\DynamicMatchPage.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Upload, X, CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn, getFullImageUrl, userTimezone } from "@/lib/utils";
import DynamicMatchesTable from "./DynamicMatchesTable";
import { getAllPlayers } from "@/lib/services/playlistDataApi";
import apiEndpoint from "@/lib/axios";
import VotingList from "./VotingList";

interface AvailablePlayer {
  id: number;
  image: string;
  jersey_number: number;
  name: string;
  status?: string;
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
  match_timezone?: string | null;
}

export default function DynamicMatchPage() {
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    match_timezone: "",
  });

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
          const formattedPlayers = response.data.map(
            (player: AvailablePlayer) => ({
              id: player.id,
              name: player.name,
              image: player.image,
              jersey_number: player.jersey_number,
              status: player.status,
            })
          );
          setAvailablePlayers(formattedPlayers);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
        toast.error("Failed to load players");
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, []);

  // Form handling functions
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
    });
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

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) return;

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

      setIsSubmitting(true);

      // Create FormData for multipart/form-data
      const submitFormData = new FormData();
      submitFormData.append("team_a", formData.teamAName);
      submitFormData.append("team_b", formData.teamBName);
      submitFormData.append("time", convertTimeToAPI(formData.time));
      submitFormData.append("date", convertDateToAPI(formData.date));
      submitFormData.append("match_timezone", userTimezone);

      // Send multiple fields with the same name for array handling
      // This will create: selected_players_ids: [3,4,2,7,8] format
      formData.selectedPlayers.forEach((playerId) => {
        submitFormData.append("selected_players_ids", playerId);
      });

      if (formData.status) {
        submitFormData.append("status", formData.status);
      }

      if (formData.winner && formData.winner !== "no_winner") {
        submitFormData.append("winner", formData.winner);
      }

      // Add images if selected
      if (formData.teamAImage) {
        submitFormData.append("team_a_pics", formData.teamAImage);
      }

      if (formData.teamBImage) {
        submitFormData.append("team_b_pics", formData.teamBImage);
      }

      // Create new match
      const response = await apiEndpoint.post("/matches/", submitFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      if (response.data) {
        // Refresh matches data
        setRefreshKey((prev) => prev + 1);
        // Close dialog and reset form
        setIsAddMatchOpen(false);
        resetForm();
        toast.success("Match created successfully!");
      }
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("An error occurred while creating the match.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMatchUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold text-secondary font-oswald">
          Matches
        </h1>
        <Button
          className="bg-primary hover:bg-primary/90 text-black"
          onClick={() => setIsAddMatchOpen(true)}
        >
          <Plus size={18} />
          Add Match
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="bg-transparent border-b border-gray-200 font-oswald justify-start gap-2 h-auto p-0">
          <TabsTrigger
            value="all"
            className="rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="voting"
            className="rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2"
          >
            Voting
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2"
          >
            Live Match
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="finished"
            className="rounded-none data-[state=active]:bg-primary text-secondary data-[state=active]:text-[#141b34] data-[state=active]:shadow-none px-6 py-2"
          >
            Finished
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DynamicMatchesTable
            key={`all-${refreshKey}`}
            itemsPerPage={12}
            paginate={true}
            title=""
            status="all"
            addMatch={false}
            showActions={true}
            onMatchUpdate={handleMatchUpdate}
          />
        </TabsContent>

        <TabsContent value="voting" className="mt-6">
          <VotingList paginate={true} itemsPerPage={12} title={false} />
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          <DynamicMatchesTable
            key={`live-${refreshKey}`}
            itemsPerPage={12}
            paginate={true}
            title=""
            status="live"
            addMatch={false}
            showActions={true}
            onMatchUpdate={handleMatchUpdate}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <DynamicMatchesTable
            key={`upcoming-${refreshKey}`}
            itemsPerPage={12}
            paginate={true}
            title=""
            status="upcoming"
            addMatch={false}
            showActions={true}
            onMatchUpdate={handleMatchUpdate}
          />
        </TabsContent>

        <TabsContent value="finished" className="mt-6">
          <DynamicMatchesTable
            key={`finished-${refreshKey}`}
            itemsPerPage={12}
            paginate={true}
            title=""
            status="finished"
            addMatch={false}
            showActions={true}
            onMatchUpdate={handleMatchUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* Add Match Dialog */}
      <Dialog open={isAddMatchOpen} onOpenChange={setIsAddMatchOpen}>
        <DialogContent
          className="sm:max-w-md p-0 overflow-hidden"
          showCloseButton={false}
        >
          <DialogHeader className="bg-primary p-4 flex flex-row items-center justify-between">
            <DialogTitle className="text-[#141b34] text-xl">
              Add Match
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary-light rounded-full border-2 border-red-500"
              onClick={() => {
                setIsAddMatchOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-red-500" />
            </Button>
          </DialogHeader>

          <div className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-5 mb-4">
              <div className="space-y-2">
                <label className="font-medium text-[#141b34]">Team A *</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Name"
                    className="flex-1"
                    value={formData.teamAName}
                    onChange={(e) =>
                      handleInputChange("teamAName", e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 bg-transparent"
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
                    disabled={isSubmitting}
                  >
                    <Upload size={18} />
                  </Button>
                </div>
                {formData.teamAImage && (
                  <p className="text-sm text-green-600">
                    Image selected: {formData.teamAImage.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-medium text-[#141b34]">Team B *</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Name"
                    className="flex-1"
                    value={formData.teamBName}
                    onChange={(e) =>
                      handleInputChange("teamBName", e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 bg-transparent"
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
                    disabled={isSubmitting}
                  >
                    <Upload size={18} />
                  </Button>
                </div>
                {formData.teamBImage && (
                  <p className="text-sm text-green-600">
                    Image selected: {formData.teamBImage.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-4">
              <div className="space-y-2">
                <label className="font-medium text-[#141b34]">Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="time"
                    className="pl-10"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-medium text-[#141b34]">Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date: Date | undefined) =>
                        handleInputChange("date", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-4">
              <div className="space-y-2">
                <label className="font-medium text-[#141b34]">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="font-medium text-[#141b34]">Winner</label>
                <Select
                  value={formData.winner}
                  onValueChange={(value) => handleInputChange("winner", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Winner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_winner">No Winner</SelectItem>
                    <SelectItem value="team_a">Win Team A</SelectItem>
                    <SelectItem value="team_b">Win Team B</SelectItem>
                    <SelectItem value="draw">Match Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.winner && formData.winner !== "no_winner" && (
              <div className="space-y-2 mb-4">
                <label className="font-medium text-[#141b34]">
                  Goal Difference
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter goal difference"
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
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-2 mb-4">
              <label className="font-medium text-[#141b34]">
                Select Player
              </label>
              <div className="flex gap-2 mt-1">
                <Select onValueChange={handleAddPlayer} disabled={isSubmitting}>
                  <SelectTrigger className="flex-1">
                    <SelectValue
                      className="text-gray-600"
                      placeholder={
                        loadingPlayers ? "Loading players..." : "Select Player"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPlayers ? (
                      <SelectItem value="loading" disabled>
                        Loading players...
                      </SelectItem>
                    ) : availablePlayers.length === 0 ? (
                      <SelectItem value="no-players" disabled>
                        No players available
                      </SelectItem>
                    ) : (
                      availablePlayers.map((player) => (
                        <SelectItem
                          key={player.id}
                          value={player.id.toString()}
                          disabled={formData.selectedPlayers.includes(
                            player.id.toString()
                          )}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full min-w-0">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarImage
                                  src={
                                    getFullImageUrl(player.image) || "/user.png"
                                  }
                                  alt={player.name}
                                  className="w-6 h-6 object-cover"
                                />
                              </Avatar>
                              <span className="truncate">{player.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0 ml-2">
                              {player.jersey_number}
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
                <div className="mt-3">
                  <label className="text-sm font-medium text-[#141b34] mb-2 block">
                    Selected Players ({formData.selectedPlayers.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedPlayers.map((playerId) => {
                      const player = availablePlayers.find(
                        (p) => p.id.toString() === playerId
                      );
                      return (
                        <div
                          key={playerId}
                          className="bg-primary/20 text-[#141b34] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          <Avatar className="w-5 h-5">
                            <AvatarImage
                              src={
                                getFullImageUrl(player?.image ?? "") ||
                                "/user.png"
                              }
                              alt={player?.name}
                              className="w-5 h-5 object-cover"
                            />
                          </Avatar>
                          {player?.name}
                          <span className="text-xs bg-white px-1 rounded">
                            #{player?.jersey_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePlayer(playerId)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isSubmitting}
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

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddMatchOpen(false);
                  resetForm();
                }}
                className="hover:bg-gray-200 hover:text-black"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-[#141b34]"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
