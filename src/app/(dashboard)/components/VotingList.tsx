// src\app\(dashboard)\components\VotingList.tsx
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
import Link from "next/link";

const votingData = Array(9).fill({
  user: {
    name: "Kristin Watson",
    avatar: "/ellipse-12-7.png",
  },
  email: "kristinwatson@gmail.com",
  team: "Dumbarton",
  goals: "2",
  players: ["11", "10", "111"],
});

export default function VotingList() {
  return (
    <main className='flex flex-col w-full items-center'>
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
    </main>
  );
}
