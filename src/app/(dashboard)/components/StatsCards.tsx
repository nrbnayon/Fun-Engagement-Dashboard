// src\app\(dashboard)\components\StatsCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import { FaUsers } from "react-icons/fa";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getOverViewStats } from "@/lib/services/overviewApi";
import { getAllMatch } from "@/lib/services/matchDataApi";
// import { getFullImageUrl } from "@/lib/utils";

const matchCards = [
  {
    title: "Voting Match",
    teamA: {
      name: "Dumbarton",
      logo: "/clubcrest--2--1-1.png",
    },
    teamB: {
      name: "Manchester",
      logo: "/stowhy8qeoz7mplxkp2kc-1-1.png",
    },
    status: "Live",
    time: "Sat 24 may - 20:15",
  },
  {
    title: "Upcoming Match",
    teamA: {
      name: "Dumbarton",
      logo: "/ellipse-2-7.png",
    },
    teamB: {
      name: "Manchester",
      logo: "/stowhy8qeoz7mplxkp2kc-1-1.png",
    },
    status: "Live",
    time: "Sat 24 may - 20:15",
  },
];

export default async function StatsCards() {
  // Await the async function
  const statsResponse = await getOverViewStats();
  const matchDataResponse = await getAllMatch();

  // getFullImageUrl(each image url genate );

  console.log("Get All match::::::::::::::", matchDataResponse);

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
                        src={match.teamA.logo}
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
