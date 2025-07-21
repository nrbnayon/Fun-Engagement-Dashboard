// src\app\(dashboard)\components\StatsCards.tsx
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { FaUsers } from "react-icons/fa";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getOverViewStats } from "@/lib/services/overviewApi";
import { getAllMatch } from "@/lib/services/matchDataApi";
import { getAllVotings } from "@/lib/services/votingDataApi";
import { getFullImageUrl } from "@/lib/utils";
import { useEffect, useState } from "react";

// Type definitions for API responses
interface Player {
  id: number;
  image: string;
  jersey_number: number;
  name: string;
  status: string;
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

interface VotingData {
  goal_difference: number;
  id: number;
  match: number;
  points_earned: number;
  selected_players: Player[];
  user: {
    email: string;
    id: number;
    is_verified: boolean;
    role: string;
    user_profile: {
      id: number;
      joined_date: string;
      name: string;
      phone_number: string;
      profile_picture: string;
      user: number;
    };
  };
  who_will_win: string;
}

interface MatchResponse {
  success: boolean;
  data: Match[];
}

interface VotingResponse {
  success: boolean;
  data: VotingData[];
}

interface StatsData {
  total_users?: number;
  total_votes?: number;
}

interface StatsResponse {
  success: boolean;
  data?: StatsData;
}

// Type guard functions
const isStatsResponse = (response: unknown): response is StatsResponse => {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    typeof (response as StatsResponse).success === "boolean"
  );
};

const isMatchResponse = (response: unknown): response is MatchResponse => {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    typeof (response as MatchResponse).success === "boolean" &&
    "data" in response &&
    Array.isArray((response as MatchResponse).data)
  );
};

const isVotingResponse = (response: unknown): response is VotingResponse => {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    typeof (response as VotingResponse).success === "boolean" &&
    "data" in response &&
    Array.isArray((response as VotingResponse).data)
  );
};

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

export default function StatsCards() {
  const [statsResponse, setStatsResponse] = useState<StatsResponse>({
    success: false,
    data: undefined,
  });
  const [upcomingMatchResponse, setUpcomingMatchResponse] =
    useState<MatchResponse>({ success: false, data: [] });
  const [votingResponse, setVotingResponse] = useState<VotingResponse>({
    success: false,
    data: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [stats, upcoming, voting] = await Promise.all([
          getOverViewStats(),
          getAllMatch(),
          getAllVotings(),
        ]);

        // Type guard the responses
        if (isStatsResponse(stats)) {
          setStatsResponse(stats);
        } else {
          console.error("Invalid stats response format:", stats);
        }

        if (isMatchResponse(upcoming)) {
          setUpcomingMatchResponse(upcoming);
        } else {
          console.error("Invalid upcoming match response format:", upcoming);
        }

        if (isVotingResponse(voting)) {
          setVotingResponse(voting);
        } else {
          console.error("Invalid voting response format:", voting);
        }

        // console.log("Get Upcoming match::::::::::::::", upcoming);
        // console.log("Get Voting match::::::::::::::", voting);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <main className='flex flex-col w-full items-center'>
        <div className='flex flex-col lg:flex-row items-stretch gap-5 w-full'>
          <div className='flex flex-row sm:flex-row gap-5 w-full lg:w-auto'>
            {[1, 2].map((i) => (
              <Card
                key={i}
                className='flex flex-col flex-1 sm:w-44 h-40 items-center justify-center p-3 bg-surface border-border dark:bg-surface'
              >
                <div className='animate-pulse bg-gray-300 dark:bg-gray-600 h-6 w-16 rounded'></div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Create stats data based on API response
  const statsData = [
    {
      icon: <FaUsers className='h-6 w-6 text-foreground' />,
      title: "Total User",
      value: statsResponse.success
        ? statsResponse.data?.total_users?.toString() || "0"
        : "0",
    },
    {
      icon: (
        <Image
          className='h-6 w-6'
          alt='Voting'
          src='/voting.svg'
          width={24}
          height={24}
        />
      ),
      title: "Attend Voting",
      value: statsResponse.success
        ? statsResponse.data?.total_votes?.toString() || "0"
        : "0",
    },
  ];

  // Filter matches by status
  const upcomingMatches = upcomingMatchResponse.success
    ? upcomingMatchResponse.data.filter((match) => match.status === "upcoming")
    : [];

  // Get voting match from voting API - find a live match that has voting data
  let votingMatch: Match | null = null;
  if (votingResponse.success && votingResponse.data.length > 0) {
    const allMatches = upcomingMatchResponse.success
      ? upcomingMatchResponse.data
      : [];

    // Get all match IDs that have voting data
    const votingMatchIds = votingResponse.data.map((voting) => voting.match);

    // Find a live match that has voting data
    votingMatch =
      allMatches.find(
        (match) => match.status === "live" && votingMatchIds.includes(match.id)
      ) || null;
  }

  // Get upcoming match data (first upcoming match that's not the voting match)
  const upcomingMatch: Match | null =
    upcomingMatches.find((match) =>
      votingMatch ? match.id !== votingMatch.id : true
    ) || (upcomingMatches.length > 0 ? upcomingMatches[0] : null);

  // Format date and time for display with AM/PM
  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);

      // Convert 24-hour to 12-hour format
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight
      const timeStr = `${displayHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${period}`;

      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
      };
      const formattedDate = dateObj.toLocaleDateString("en-US", options);
      return `${formattedDate} - ${timeStr}`;
    } catch {
      return `${date} - ${time}`;
    }
  };

  // Create match cards array only if matches exist
  const matchCards = [];

  // Add voting match card only if voting match exists and is live
  if (votingMatch) {
    matchCards.push({
      title: "Voting Match",
      teamA: {
        name: votingMatch.team_a,
        logo: votingMatch.team_a_pics
          ? getFullImageUrl(votingMatch.team_a_pics)
          : null,
        initials: getTeamInitials(votingMatch.team_a),
      },
      teamB: {
        name: votingMatch.team_b,
        logo: votingMatch.team_b_pics
          ? getFullImageUrl(votingMatch.team_b_pics)
          : null,
        initials: getTeamInitials(votingMatch.team_b),
      },
      status: "Live",
      time: formatDateTime(votingMatch.date, votingMatch.time),
    });
  }

  // Add upcoming match card if upcoming match exists and it's different from voting match
  if (upcomingMatch) {
    matchCards.push({
      title: "Upcoming Match",
      teamA: {
        name: upcomingMatch.team_a,
        logo: upcomingMatch.team_a_pics
          ? getFullImageUrl(upcomingMatch.team_a_pics)
          : null,
        initials: getTeamInitials(upcomingMatch.team_a),
      },
      teamB: {
        name: upcomingMatch.team_b,
        logo: upcomingMatch.team_b_pics
          ? getFullImageUrl(upcomingMatch.team_b_pics)
          : null,
        initials: getTeamInitials(upcomingMatch.team_b),
      },
      status: "Upcoming",
      time: formatDateTime(upcomingMatch.date, upcomingMatch.time),
    });
  }

  return (
    <main className='flex flex-col w-full items-center'>
      <div className='flex flex-col lg:flex-row items-stretch gap-5 w-full'>
        {/* Stats Cards Container */}
        <div className='flex flex-row sm:flex-row gap-5 w-full lg:w-auto'>
          {statsData.map((card, index) => (
            <Card
              key={index}
              className='flex flex-col flex-1 sm:w-44 h-40 items-center justify-between gap-3 p-3 bg-surface border-border dark:bg-surface'
            >
              <CardContent className='p-0 flex flex-col items-center justify-between gap-3 w-full h-full'>
                <div className='inline-flex items-center gap-2 p-3 bg-secondary-light dark:bg-surface-elevated rounded-full'>
                  {card.icon}
                </div>
                <div className='flex flex-col items-start gap-1 w-full'>
                  <div className='w-full font-regular-lg-regular text-foreground text-center'>
                    {card.title}
                  </div>
                  <div className='font-oswald font-medium text-foreground text-3xl w-full text-center'>
                    {card.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Match Cards Container - Only render if there are match cards */}
        {matchCards.length > 0 && (
          <div className='flex flex-col lg:flex-row gap-5 w-full lg:w-auto'>
            {matchCards.map((match, index) => (
              <Card
                key={index}
                className='flex flex-col w-full lg:w-auto h-40 items-start justify-between gap-6 px-4 sm:px-6 py-4 border-border bg-card dark:bg-surface'
              >
                <CardContent className='p-0 w-full h-full flex flex-col justify-between'>
                  <div className='font-regular-lg-regular text-foreground'>
                    {match.title}
                  </div>
                  <div className='inline-flex items-center justify-between sm:gap-[38px] w-full'>
                    <div className='flex flex-col w-12 sm:w-14 items-center gap-2 sm:gap-3'>
                      <Avatar>
                        {match.teamA.logo ? (
                          <AvatarImage
                            className='w-8 h-8 sm:w-10 sm:h-10 object-cover rounded'
                            alt={`${match.teamA.name} logo`}
                            src={match.teamA.logo}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <AvatarFallback className='w-8 h-8 sm:w-10 sm:h-10 text-xs font-semibold'>
                            {match.teamA.initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className='w-full font-regular-lg-regular text-foreground text-center text-xs sm:text-sm'>
                        {match.teamA.name}
                      </div>
                    </div>
                    <div className='flex flex-col w-20 sm:w-24 items-center gap-2 sm:gap-3'>
                      <div className='w-full font-regular-lg-regular text-red-500 text-center text-xs sm:text-sm'>
                        {match.status}
                      </div>
                      <div className='w-full font-regular-lg-regular text-foreground text-center text-xs sm:text-sm'>
                        {match.time}
                      </div>
                    </div>
                    <div className='flex flex-col w-12 sm:w-14 items-center gap-2 sm:gap-3'>
                      <Avatar>
                        {match.teamB.logo ? (
                          <AvatarImage
                            className='w-8 h-8 sm:w-10 sm:h-10 object-cover rounded'
                            alt={`${match.teamB.name} logo`}
                            src={match.teamB.logo}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <AvatarFallback className='w-8 h-8 sm:w-10 sm:h-10 text-xs font-semibold'>
                            {match.teamB.initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className='w-full font-regular-lg-regular text-foreground text-center text-xs sm:text-sm'>
                        {match.teamB.name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
