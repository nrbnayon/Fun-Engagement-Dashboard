// src\app\(dashboard)\components\MatchesList.tsx
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
import Image from "next/image";
import Link from "next/link";

// Data for matches list
const matchesData = Array(8).fill({
  teamA: {
    name: "Dumbarton",
    logo: "/clubcrest--2--1-3.png",
  },
  teamB: {
    name: "Real Madrid",
    logo: "/clubcrest--2--1-4.png",
  },
  time: "5:00 PM",
  date: "12 Jun 2025",
  players: Array(16).fill("/ellipse-2-7.png"),
});

export default function MatchesList() {
  return (
    <main className='flex flex-col w-full items-center'>
      {/* Matches List Section */}
      <div className='flex flex-col items-start gap-5 w-full'>
        <div className='flex items-center justify-between w-full font-oswald'>
          <h2 className='text-2xl text-secondary'>Matches List</h2>
          <Link href='matchs' className='text-secondary text-base tracking-[0] leading-[normal]'>
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
}
