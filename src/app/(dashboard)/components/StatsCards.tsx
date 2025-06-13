import { Card, CardContent } from "@/components/ui/card";
import { FaUsers } from "react-icons/fa";
import Image from "next/image";

const statsData = [
  {
    icon: <FaUsers  className="h-6 w-6 text-black" />,
    title: "Total User",
    value: "1402",
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
    value: "1000",
  },
];

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
      logo: "/clubcrest--2--1-2.png",
    },
    teamB: {
      name: "Manchester",
      logo: "/stowhy8qeoz7mplxkp2kc-1-1.png",
    },
    status: "Live",
    time: "Sat 24 may - 20:15",
  },
];

export default function StatsCards() {
  return (
    <main className="flex flex-col w-full items-center">
      <div className="flex  items-stretch gap-5 w-full">
        {statsData.map((card, index) => (
          <Card
            key={index}
            className="flex flex-col w-44 h-40 items-center justify-between gap-3 p-3 bg-white border-border"
          >
            <CardContent className="p-0 flex flex-col items-center justify-between gap-3 w-full h-full">
              <div className="inline-flex items-center gap-2 p-3 bg-blue-100 rounded-full">
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

        {/* Match Cards */}
        {matchCards.map((match, index) => (
          <Card
            key={index}
            className="flex flex-col w-96 h-40 items-start justify-between gap-6 px-6 py-4 border-border bg-card"
          >
            <CardContent className="p-0 w-full h-full flex flex-col justify-between">
              <div className="font-regular-lg-regular text-foreground">
                {match.title}
              </div>
              <div className="inline-flex items-center gap-[38px]">
                <div className="flex flex-col w-14 items-center gap-3">
                  <Image
                    className="w-10 h-10 object-cover rounded"
                    alt="Team A logo"
                    src={match.teamA.logo}
                    width={40}
                    height={40}
                  />
                  <div className="w-full font-regular-lg-regular text-foreground text-center">
                    {match.teamA.name}
                  </div>
                </div>
                <div className="flex flex-col w-[97px] items-center gap-3">
                  <div className="w-full font-regular-lg-regular text-red-500 text-center">
                    {match.status}
                  </div>
                  <div className="w-full font-regular-lg-regular text-foreground text-center">
                    {match.time}
                  </div>
                </div>
                <div className="flex flex-col w-[59px] items-center gap-3">
                  <Image
                    className="w-10 h-10 object-cover rounded"
                    alt="Team B logo"
                    src={match.teamB.logo}
                    width={40}
                    height={40}
                  />
                  <div className="w-full font-regular-lg-regular text-foreground text-center">
                    {match.teamB.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
