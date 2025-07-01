// src\app\(dashboard)\components\StatsCards.tsx
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { FaUsers } from "react-icons/fa";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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

        console.log("Get Upcoming match::::::::::::::", upcoming);
        console.log("Get Voting match::::::::::::::", voting);
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
      <main className="flex flex-col w-full items-center">
        <div className="flex flex-col lg:flex-row items-stretch gap-5 w-full">
          <div className="flex flex-row sm:flex-row gap-5 w-full lg:w-auto">
            {[1, 2].map((i) => (
              <Card
                key={i}
                className="flex flex-col flex-1 sm:w-44 h-40 items-center justify-center p-3 bg-surface border-border dark:bg-surface"
              >
                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-6 w-16 rounded"></div>
              </Card>
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
            {[1, 2].map((i) => (
              <Card
                key={i}
                className="flex flex-col w-full lg:w-96 h-40 items-center justify-center px-4 sm:px-6 py-4 border-border bg-card dark:bg-surface"
              >
                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-6 w-24 rounded"></div>
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
      icon: <FaUsers className="h-6 w-6 text-foreground" />,
      title: "Total User",
      value: statsResponse.success
        ? statsResponse.data?.total_users?.toString() || "0"
        : "0",
    },
    {
      icon: (
        <Image
          className="h-6 w-6"
          alt="Voting"
          src="/voting.svg"
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

  // Filter matches by status - exclude finished matches
  const liveMatches = upcomingMatchResponse.success
    ? upcomingMatchResponse.data.filter((match) => match.status === "live")
    : [];

  const upcomingMatches = upcomingMatchResponse.success
    ? upcomingMatchResponse.data.filter((match) => match.status === "upcoming")
    : [];

  // Get voting match from voting API
  // Find the match that corresponds to the first voting entry
  let votingMatch: Match | null = null;
  if (votingResponse.success && votingResponse.data.length > 0) {
    const firstVoting = votingResponse.data[0];
    const matchId = firstVoting.match;

    // Find the corresponding match from all matches
    const allMatches = upcomingMatchResponse.success
      ? upcomingMatchResponse.data
      : [];
    votingMatch = allMatches.find((match) => match.id === matchId) || null;
  }

  // If no voting match found, use first live or upcoming match
  if (!votingMatch) {
    votingMatch =
      liveMatches.length > 0
        ? liveMatches[0]
        : upcomingMatches.length > 0
        ? upcomingMatches[0]
        : null;
  }

  // Get upcoming match data (first upcoming match that's not the voting match)
  const upcomingMatch: Match | null =
    upcomingMatches.find((match) =>
      votingMatch ? match.id !== votingMatch.id : true
    ) || (upcomingMatches.length > 0 ? upcomingMatches[0] : null);

  // Format date and time for display
  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date);
      const timeStr = time.substring(0, 5); // Get HH:MM from HH:MM:SS
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

  // Create match cards with actual API data
  const matchCards = [
    {
      title: "Voting Match",
      teamA: {
        name: votingMatch?.team_a || "Team A",
        logo: votingMatch?.selected_players?.[0]?.image
          ? getFullImageUrl(votingMatch.selected_players[0].image)
          : "/clubcrest--2--1-1.png",
      },
      teamB: {
        name: votingMatch?.team_b || "Team B",
        logo: "/stowhy8qeoz7mplxkp2kc-1-1.png", // Default logo for team B
      },
      status:
        votingMatch?.status === "live"
          ? "Live"
          : votingMatch?.status === "upcoming"
          ? "Upcoming"
          : "TBD",
      time: votingMatch
        ? formatDateTime(votingMatch.date, votingMatch.time)
        : "TBD",
    },
    {
      title: "Upcoming Match",
      teamA: {
        name: upcomingMatch?.team_a || "Team A",
        logo: upcomingMatch?.selected_players?.[0]?.image
          ? getFullImageUrl(upcomingMatch.selected_players[0].image)
          : "/ellipse-2-7.png",
      },
      teamB: {
        name: upcomingMatch?.team_b || "Team B",
        logo: "/stowhy8qeoz7mplxkp2kc-1-1.png", // Default logo for team B
      },
      status: "Upcoming",
      time: upcomingMatch
        ? formatDateTime(upcomingMatch.date, upcomingMatch.time)
        : "TBD",
    },
  ];

  return (
    <main className="flex flex-col w-full items-center">
      <div className="flex flex-col lg:flex-row items-stretch gap-5 w-full">
        {/* Stats Cards Container */}
        <div className="flex flex-row sm:flex-row gap-5 w-full lg:w-auto">
          {statsData.map((card, index) => (
            <Card
              key={index}
              className="flex flex-col flex-1 sm:w-44 h-40 items-center justify-between gap-3 p-3 bg-surface border-border dark:bg-surface"
            >
              <CardContent className="p-0 flex flex-col items-center justify-between gap-3 w-full h-full">
                <div className="inline-flex items-center gap-2 p-3 bg-secondary-light dark:bg-surface-elevated rounded-full">
                  {card.icon}
                </div>
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="w-full font-regular-lg-regular text-foreground text-center">
                    {card.title}
                  </div>
                  <div className="font-oswald font-medium text-foreground text-3xl w-full text-center">
                    {card.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Match Cards Container */}
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
          {matchCards.map((match, index) => (
            <Card
              key={index}
              className="flex flex-col w-full lg:w-96 h-40 items-start justify-between gap-6 px-4 sm:px-6 py-4 border-border bg-card dark:bg-surface"
            >
              <CardContent className="p-0 w-full h-full flex flex-col justify-between">
                <div className="font-regular-lg-regular text-foreground">
                  {match.title}
                </div>
                <div className="inline-flex items-center justify-between sm:gap-[38px] w-full">
                  <div className="flex flex-col w-12 sm:w-14 items-center gap-2 sm:gap-3">
                    <Avatar>
                      <AvatarImage
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded"
                        alt="Team A logo"
                        src={match.teamA.logo || "/default-team-a-logo.png"}
                        width={40}
                        height={40}
                      />
                    </Avatar>
                    <div className="w-full font-regular-lg-regular text-foreground text-center text-xs sm:text-sm">
                      {match.teamA.name}
                    </div>
                  </div>
                  <div className="flex flex-col w-20 sm:w-24 items-center gap-2 sm:gap-3">
                    <div className="w-full font-regular-lg-regular text-red-500 text-center text-xs sm:text-sm">
                      {match.status}
                    </div>
                    <div className="w-full font-regular-lg-regular text-foreground text-center text-xs sm:text-sm">
                      {match.time}
                    </div>
                  </div>
                  <div className="flex flex-col w-12 sm:w-14 items-center gap-2 sm:gap-3">
                    <Avatar>
                      <AvatarImage
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded"
                        alt="Team B logo"
                        src={match.teamB.logo}
                        width={40}
                        height={40}
                      />
                    </Avatar>
                    <div className="w-full font-regular-lg-regular text-foreground text-center text-xs sm:text-sm">
                      {match.teamB.name}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
