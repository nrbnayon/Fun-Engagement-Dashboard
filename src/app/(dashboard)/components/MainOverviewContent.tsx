// src\app\(dashboard)\components\MainOverviewContent.tsx
import React from "react";
import {Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Data for stats cards
const statsData = [
  {
    icon: <UserIcon className='h-6 w-6' />,
    title: "Total User",
    value: "1402",
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
    value: "1000",
  },
];

// Data for match cards
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
      logo: "/logo.png",
    },
    teamB: {
      name: "Manchester",
      logo: "/stowhy8qeoz7mplxkp2kc-1-1.png",
    },
    status: "Live",
    time: "Sat 24 may - 20:15",
  },
];

// Data for voting table
const votingData = Array(9).fill({
  user: {
    name: "Kristin Watson",
    avatar: "/android-chrome-192x192.png",
  },
  email: "kristinwatson@gmail.com",
  team: "Dumbarton",
  goals: "2",
  players: ["11", "10", "111"],
});

// Data for matches list
const matchesData = Array(8).fill({
  teamA: {
    name: "Dumbarton",
    logo: "/logo.png",
  },
  teamB: {
    name: "Real Madrid",
    logo: "/ellipse-2-7.png",
  },
  time: "5:00 PM",
  date: "12 Jun 2025",
  players: Array(16).fill("/ellipse-2-7.png"),
});

export const MainOverviewContent = () => {
  return (
    <main className='flex flex-col w-full items-center gap-6'>
      {/* Stats and Match Cards Row */}
      <div className='flex  items-stretch gap-5 w-full'>
        {statsData.map((card, index) => (
          <Card
            key={index}
            className='flex flex-col w-44 h-40 items-center justify-between gap-3 p-3 bg-white border-border'
          >
            <CardContent className='p-0 flex flex-col items-center justify-between gap-3 w-full h-full'>
              <div className='inline-flex items-center gap-2 p-3 bg-secondary-light rounded-full'>
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

        {/* Match Cards */}
        {matchCards.map((match, index) => (
          <Card
            key={index}
            className='flex flex-col w-96 h-40 items-start justify-between gap-6 px-6 py-4 border-border bg-card'
          >
            <CardContent className='p-0 w-full h-full flex flex-col justify-between'>
              <div className='font-regular-lg-regular text-foreground'>
                {match.title}
              </div>
              <div className='inline-flex items-center gap-[38px]'>
                <div className='flex flex-col w-14 items-center gap-3'>
                  <Avatar>
                    <AvatarImage 
                      className='w-10 h-10 object-cover rounded'
                      alt='Team A logo'
                      src={match.teamA.logo}
                      width={40}
                      height={40}
                    />
                  </Avatar>
                  <div className='w-full font-regular-lg-regular text-foreground text-center'>
                    {match.teamA.name}
                  </div>
                </div>
                <div className='flex flex-col w-24 items-center gap-3'>
                  <div className='w-full font-regular-lg-regular text-red-500 text-center'>
                    {match.status}
                  </div>
                  <div className='w-full font-regular-lg-regular text-foreground text-center'>
                    {match.time}
                  </div>
                </div>
                <div className='flex flex-col w-14 items-center gap-3'>
                  <Avatar>
                    <AvatarImage
                      className='w-10 h-10 object-cover rounded'
                      alt='Team B logo'
                      src={match.teamB.logo}
                      width={40}
                      height={40}
                    />
                  </Avatar>
                  <div className='w-full font-regular-lg-regular text-foreground text-center'>
                    {match.teamB.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voting Section */}
      <div className='flex flex-col items-start gap-5 w-full'>
        <div className='flex items-center justify-between w-full font-oswald'>
          <h2 className='text-2xl text-secondary'>Voting</h2>
          <Link href='voting' className='text-secondary text-base tracking-[0] leading-[normal]'>
            See All
          </Link>
        </div>

        <Card className='w-full min-h-74 rounded-xl bg-card overflow-hidden border-border p-0'>
          <CardContent className='p-0'>
            <Table className='border-collapse'>
              <TableHeader className='border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300'>
                <TableRow>
                  <TableHead className='font-normal text-secondary pl-8 py-4'>
                    User
                  </TableHead>
                  <TableHead className='font-normal text-secondary pl-6 py-4'>
                    Email
                  </TableHead>
                  <TableHead className='font-normal text-secondary pl-6 py-4'>
                    Who Will Win
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
                {votingData.slice(0, 5).map((item, index) => (
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
      </div>

      {/* Matches List Section */}
      <div className='flex flex-col items-start gap-5 w-full'>
        <div className='flex items-center justify-between w-full font-oswald'>
          <h2 className='text-2xl text-secondary'>Matches List</h2>
          <Link href='/matches' className='text-secondary text-base tracking-[0] leading-[normal]'>
            See All
          </Link>
        </div>

        <Card className='w-full min-h-74 rounded-xl bg-card overflow-hidden border-border p-0'>
          <CardContent className='p-0'>
            <Table className='border-collapse'>
              <TableHeader className='border-b-2 border-primary text-xl py-4 md:text-2xl bg-card hover:bg-yellow-300'>
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
                  <TableHead className='font-normal text-center text-secondarys py-4'>
                    Player
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='bg-white'>
                {matchesData.slice(0, 5).map((match, index) => (
                  <TableRow key={index}>
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
                              className={idx > 0 ? "-ml-2" : ""}
                            >
                              <AvatarImage
                                className='w-10 h-10 object-cover rounded-full border-2 border-border'
                                alt={`Player ${idx + 1}`}
                                src={
                                  typeof player === "string"
                                    ? player
                                    : "/ellipse-17-7.png"
                                }
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
      </div>
    </main>
  );
};
