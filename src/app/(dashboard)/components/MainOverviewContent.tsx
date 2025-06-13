// // src\app\(dashboard)\components\MainOverviewContent.tsx
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Avatar } from "@radix-ui/react-avatar";
// import { Badge, UserIcon } from "lucide-react";
// import Image from "next/image";
// import React from "react";

// // Data for stats cards
// const statsCards = [
//   {
//     icon: <UserIcon className="h-6 w-6" />,
//     title: "Total User",
//     value: "1402",
//   },
//   {
//     icon: (
//       <Image
//         className="h-6 w-6"
//         alt="Voting"
//         src="/voting.svg"
//         width={24}
//         height={24}
//       />
//     ),
//     title: "Attend Voting",
//     value: "1000",
//   },
// ];

// // Data for match cards
// const matchCards = [
//   {
//     title: "Voting Match",
//     teamA: {
//       name: "Dumbarton",
//       logo: "/clubcrest--2--1-1.png",
//     },
//     teamB: {
//       name: "Manchester",
//       logo: "/stowhy8qeoz7mplxkp2kc-1-1.png",
//     },
//     status: "Live",
//     time: "Sat 24 may - 20:15",
//   },
//   {
//     title: "Upcoming Match",
//     teamA: {
//       name: "Dumbarton",
//       logo: "/clubcrest--2--1-2.png",
//     },
//     teamB: {
//       name: "Manchester",
//       logo: "/stowhy8qeoz7mplxkp2kc-1-1.png",
//     },
//     status: "Live",
//     time: "Sat 24 may - 20:15",
//   },
// ];

// // Data for voting table
// const votingData = Array(9).fill({
//   user: {
//     name: "Kristin Watson",
//     avatar: "/ellipse-12-7.png",
//   },
//   email: "kristinwatson@gmail.com",
//   team: "Dumbarton",
//   goals: "2",
//   players: ["11", "10", "111"],
// });

// // Data for matches list
// const matchesData = Array(8).fill({
//   teamA: {
//     name: "Dumbarton",
//     logo: "/clubcrest--2--1-3.png",
//   },
//   teamB: {
//     name: "Real Madrid",
//     logo: "/clubcrest--2--1-4.png",
//   },
//   time: "5:00 PM",
//   date: "12 Jun 2025",
//   players: Array(16).fill("/ellipse-2-7.png"),
// });

// export const MainOverviewContent = () => {
//   return (
//     <main className="flex flex-col w-full items-center gap-6 p-8">
//       {/* Stats and Match Cards Row */}
//       <div className="flex items-center gap-5 w-full">
//         {/* Stats Cards */}
//         {statsCards.map((card, index) => (
//           <Card
//             key={index}
//             className="flex flex-col w-[166px] items-center justify-center gap-3 p-3 bg-white border-border"
//           >
//             <CardContent className="p-0 flex flex-col items-center gap-3 w-full">
//               <div className="inline-flex items-center gap-2 p-3 bg-blue-100 rounded-full">
//                 {card.icon}
//               </div>
//               <div className="flex flex-col items-start gap-1 w-full">
//                 <div className="w-full font-regular-lg-regular text-foreground text-center">
//                   {card.title}
//                 </div>
//                 <div className="font-oswald font-medium text-foreground text-3xl w-full text-center">
//                   {card.value}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}

//         {/* Match Cards */}
//         {matchCards.map((match, index) => (
//           <Card
//             key={index}
//             className="flex flex-col w-[352px] h-[156px] items-start gap-6 px-6 py-4 card-highlight"
//           >
//             <CardContent className="p-0 w-full">
//               <div className="font-regular-lg-regular text-foreground">
//                 {match.title}
//               </div>
//               <div className="inline-flex items-center gap-[38px] mt-6">
//                 <div className="flex flex-col w-14 items-center gap-3">
//                   <Image
//                     className="w-10 h-10 object-cover rounded"
//                     alt="Team A logo"
//                     src={match.teamA.logo}
//                     width={40}
//                     height={40}
//                   />
//                   <div className="w-full font-regular-lg-regular text-foreground text-center">
//                     {match.teamA.name}
//                   </div>
//                 </div>
//                 <div className="flex flex-col w-[97px] items-center gap-3">
//                   <div className="w-full font-regular-lg-regular text-red-500 text-center">
//                     {match.status}
//                   </div>
//                   <div className="w-full font-regular-lg-regular text-foreground text-center">
//                     {match.time}
//                   </div>
//                 </div>
//                 <div className="flex flex-col w-[59px] items-center gap-3">
//                   <Image
//                     className="w-10 h-10 object-cover rounded"
//                     alt="Team B logo"
//                     src={match.teamB.logo}
//                     width={40}
//                     height={40}
//                   />
//                   <div className="w-full font-regular-lg-regular text-foreground text-center">
//                     {match.teamB.name}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Voting Section */}
//       <div className="flex flex-col items-start gap-5 w-full">
//         <div className="flex items-center justify-between w-full">
//           <h2 className="font-h5-regular text-blue-500">Voting</h2>
//           <button className="font-sans font-normal text-blue-500 text-base interactive">
//             See All
//           </button>
//         </div>

//         <Card className="w-full h-[340px] bg-white rounded-xl overflow-hidden border-border">
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader className="bg-yellow-200 border-b-2 border-primary">
//                 <TableRow>
//                   <TableHead className="w-[280px] text-center font-sans font-normal text-blue-500 text-2xl">
//                     User
//                   </TableHead>
//                   <TableHead className="w-[300px] text-center font-sans font-normal text-blue-500 text-2xl">
//                     Email
//                   </TableHead>
//                   <TableHead className="w-[180px] text-center font-sans font-normal text-blue-500 text-2xl">
//                     Who will Win
//                   </TableHead>
//                   <TableHead className="w-20 text-center font-sans font-normal text-blue-500 text-2xl">
//                     Goals
//                   </TableHead>
//                   <TableHead className="w-[180px] text-center font-sans font-normal text-blue-500 text-2xl">
//                     Select Player
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {votingData.slice(0, 5).map((item, index) => (
//                   <TableRow key={index}>
//                     <TableCell className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <Avatar>
//                           <Image
//                             className="w-12 h-12 object-cover rounded-full"
//                             alt="User avatar"
//                             src={item.user.avatar}
//                             width={48}
//                             height={48}
//                           />
//                         </Avatar>
//                         <span className="font-sans font-normal text-blackblack-700 text-xl">
//                           {item.user.name}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="px-6 py-4">
//                       <div className="font-sans font-normal text-blackblack-700 text-xl">
//                         {item.email}
//                       </div>
//                     </TableCell>
//                     <TableCell className="px-6 py-4">
//                       <div className="font-sans font-normal text-blackblack-700 text-xl">
//                         {item.team}
//                       </div>
//                     </TableCell>
//                     <TableCell className="px-6 py-4 text-center">
//                       <div className="font-sans font-normal text-blackblack-700 text-xl">
//                         {item.goals}
//                       </div>
//                     </TableCell>
//                     <TableCell className="px-6 py-4">
//                       <div className="flex items-center justify-center gap-2">
//                         {item.players.map((player: string, idx: number) => (
//                           <Badge
//                             key={idx}
//                             className="flex items-center justify-center w-12 h-12 bg-white rounded-full border border-primary-medium"
//                           >
//                             <span className="font-sans font-normal text-blue-500 text-2xl">
//                               {player}
//                             </span>
//                           </Badge>
//                         ))}
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Matches List Section */}
//       <div className="flex flex-col items-start gap-5 w-full">
//         <div className="flex items-center justify-between w-full">
//           <h2 className="font-h5-regular text-blue-500">Matches List</h2>
//           <button className="font-sans font-normal text-blue-500 text-base interactive">
//             See All
//           </button>
//         </div>

//         <Card className="w-full h-[400px] bg-white rounded-xl overflow-hidden border-border">
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader className="bg-yellow-200 border-b-2 border-primary">
//                 <TableRow>
//                   <TableHead className="font-sans font-normal text-blue-500 text-2xl">
//                     Team A
//                   </TableHead>
//                   <TableHead className="font-sans font-normal text-blue-500 text-2xl">
//                     Team B
//                   </TableHead>
//                   <TableHead className="w-[120px] text-center font-sans font-normal text-blue-500 text-2xl">
//                     Time
//                   </TableHead>
//                   <TableHead className="w-40 text-center font-sans font-normal text-blue-500 text-2xl">
//                     Date
//                   </TableHead>
//                   <TableHead className="w-[300px] text-center font-sans font-normal text-blue-500 text-2xl">
//                     Player
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {matchesData.slice(0, 4).map((match, index) => (
//                   <TableRow key={index}>
//                     <TableCell className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <Image
//                           className="w-10 h-10 object-cover rounded"
//                           alt="Team A logo"
//                           src={match.teamA.logo}
//                           width={40}
//                           height={40}
//                         />
//                         <span className="font-sans font-normal text-blackblack-700 text-xl">
//                           {match.teamA.name}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <Image
//                           className="w-10 h-10 object-cover rounded"
//                           alt="Team B logo"
//                           src={match.teamB.logo}
//                           width={40}
//                           height={40}
//                         />
//                         <span className="font-sans font-normal text-blackblack-700 text-xl">
//                           {match.teamB.name}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="px-6 py-4 text-center">
//                       <div className="font-sans font-normal text-blackblack-700 text-xl">
//                         {match.time}
//                       </div>
//                     </TableCell>
//                     <TableCell className="px-6 py-4 text-center">
//                       <div className="font-sans font-normal text-blackblack-700 text-xl">
//                         {match.date}
//                       </div>
//                     </TableCell>
//                     <TableCell className="px-6 py-4">
//                       <div className="flex items-center justify-center">
//                         {match.players
//                           .slice(0, 16)
//                           .map((player: string, idx: number) => (
//                             <Avatar
//                               key={idx}
//                               className={idx > 0 ? "-ml-2" : ""}
//                             >
//                               <Image
//                                 className="w-6 h-6 object-cover rounded-full"
//                                 alt={`Player ${idx + 1}`}
//                                 src={
//                                   typeof player === "string"
//                                     ? player
//                                     : "/ellipse-17-7.png"
//                                 }
//                                 width={24}
//                                 height={24}
//                               />
//                             </Avatar>
//                           ))}
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </main>
//   );
// };

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge, UserIcon } from "lucide-react";
import React from "react";

// Data for stats cards
const statsCards = [
  {
    icon: <UserIcon className="h-6 w-6" />,
    title: "Total User",
    value: "1402",
  },
  {
    icon: <img className="h-6 w-6" alt="Voting" src="/voting.svg" />,
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

// Data for voting table
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

export const MainOverviewContent = () => {
  return (
    <main className="flex flex-col w-full items-center gap-6 p-8">
      <div className="flex items-center gap-5 w-full">
        {statsCards.map((card, index) => (
          <Card
            key={index}
            className="flex flex-col w-[166px] items-center justify-center gap-3 p-3 bg-white border-[#d2d1cc]"
          >
            <CardContent className="p-0 flex flex-col items-center gap-3 w-full">
              <div className="inline-flex items-center gap-2 p-3 bg-blue-100 rounded-[50px]">
                {card.icon}
              </div>
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="w-full font-regular-lg-regular text-blackblack-900 text-[length:var(--regular-lg-regular-font-size)] text-center tracking-[var(--regular-lg-regular-letter-spacing)] leading-[var(--regular-lg-regular-line-height)]">
                  {card.title}
                </div>
                <div className="[font-family:'Oswald',Helvetica] font-medium text-blackblack-900 text-[32px] w-full text-center tracking-[0] leading-[normal]">
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
            className="flex flex-col w-[352px] h-[156px] items-start gap-6 px-6 py-4 bg-[#f2ce1726] rounded-xl"
          >
            <CardContent className="p-0 w-full">
              <div className="font-regular-lg-regular text-blackblack-900 text-[length:var(--regular-lg-regular-font-size)] tracking-[var(--regular-lg-regular-letter-spacing)] leading-[var(--regular-lg-regular-line-height)]">
                {match.title}
              </div>
              <div className="inline-flex items-center gap-[38px] mt-6">
                <div className="flex flex-col w-14 items-center gap-3">
                  <div
                    className="w-10 h-10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${match.teamA.logo})` }}
                  />
                  <div className="w-full font-regular-lg-regular text-blackblack-900 text-[length:var(--regular-lg-regular-font-size)] text-center tracking-[var(--regular-lg-regular-letter-spacing)] leading-[var(--regular-lg-regular-line-height)]">
                    {match.teamA.name}
                  </div>
                </div>
                <div className="flex flex-col w-[97px] items-center gap-3">
                  <div className="w-full font-regular-lg-regular text-red-500 text-[length:var(--regular-lg-regular-font-size)] text-center tracking-[var(--regular-lg-regular-letter-spacing)] leading-[var(--regular-lg-regular-line-height)]">
                    {match.status}
                  </div>
                  <div className="w-full font-regular-lg-regular text-blackblack-800 text-[length:var(--regular-lg-regular-font-size)] text-center tracking-[var(--regular-lg-regular-letter-spacing)] leading-[var(--regular-lg-regular-line-height)]">
                    {match.time}
                  </div>
                </div>
                <div className="flex flex-col w-[59px] items-center gap-3">
                  <img
                    className="w-10 h-10 object-cover"
                    alt="Team logo"
                    src={match.teamB.logo}
                  />
                  <div className="w-full font-regular-lg-regular text-blackblack-900 text-[length:var(--regular-lg-regular-font-size)] text-center tracking-[var(--regular-lg-regular-letter-spacing)] leading-[var(--regular-lg-regular-line-height)]">
                    {match.teamB.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voting Section */}
      <div className="flex flex-col items-start gap-5 w-full">
        <div className="flex items-center justify-between w-full">
          <h2 className="font-h5-regular text-blue-500 text-[length:var(--h5-regular-font-size)] tracking-[var(--h5-regular-letter-spacing)] leading-[var(--h5-regular-line-height)]">
            Voting
          </h2>
          <button className="[font-family:'Poppins',Helvetica] font-normal text-blue-500 text-base tracking-[0] leading-[normal]">
            See All
          </button>
        </div>

        <Card className="w-full h-[340px] bg-white rounded-xl overflow-hidden border-[#d2d1cc]">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-yellow-200 border-b-2 border-[#f2ce17]">
                <TableRow>
                  <TableHead className="w-[280px] text-center [font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    User
                  </TableHead>
                  <TableHead className="w-[300px] text-center [font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Email
                  </TableHead>
                  <TableHead className="w-[180px] text-center [font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Who will Win
                  </TableHead>
                  <TableHead className="w-20 text-center [font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Goals
                  </TableHead>
                  <TableHead className="w-[180px] text-center [font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Select Player
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {votingData.slice(0, 5).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <img
                            className="w-12 h-12 object-cover"
                            alt="User avatar"
                            src={item.user.avatar}
                          />
                        </Avatar>
                        <span className="[font-family:'Poppins',Helvetica] font-normal text-blackblack-700 text-xl">
                          {item.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="[font-family:'Poppins',Helvetica] font-normal text-blackblack-700 text-xl">
                        {item.email}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="[font-family:'Poppins',Helvetica] font-normal text-blackblack-700 text-xl">
                        {item.team}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <div className="[font-family:'Poppins',Helvetica] font-normal text-blackblack-700 text-xl">
                        {item.goals}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {item.players.map((player, idx) => (
                          <Badge
                            key={idx}
                            className="flex items-center justify-center w-12 h-12 bg-white rounded-[50px] border border-solid border-[#fbf2c5]"
                          >
                            <span className="[font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                              {player}
                            </span>
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
      <div className="flex flex-col items-start gap-5 w-full">
        <div className="flex items-center justify-between w-full">
          <h2 className="font-h5-regular text-blue-500 text-[length:var(--h5-regular-font-size)] tracking-[var(--h5-regular-letter-spacing)] leading-[var(--h5-regular-line-height)]">
            Matches List
          </h2>
          <button className="[font-family:'Poppins',Helvetica] font-normal text-blue-500 text-base tracking-[0] leading-[normal]">
            See All
          </button>
        </div>

        <Card className="w-full h-[400px] bg-white rounded-xl overflow-hidden border-[#d2d1cc]">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-yellow-200 border-b-2 border-[#f2ce17]">
                <TableRow>
                  <TableHead className="[font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Team A
                  </TableHead>
                  <TableHead className="[font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Team B
                  </TableHead>
                  <TableHead className="w-[120px] text-center [font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Time
                  </TableHead>
                  <TableHead className="w-40 text-center [font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Date
                  </TableHead>
                  <TableHead className="w-[300px] text-center [font-family:'Poppins',Helvetica] font-normal text-blue-500 text-2xl">
                    Player
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchesData.slice(0, 4).map((match, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                          <img
                            className="w-[34px] h-9 absolute top-0.5 left-[3px]"
                            alt="Team A logo"
                            src={match.teamA.logo}
                          />
                        </div>
                        <span className="[font-family:'Poppins',Helvetica] font-normal text-blackblack-700 text-xl">
                          {match.teamA.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                          <img
                            className="w-[34px] h-9 absolute top-0.5 left-[3px]"
                            alt="Team B logo"
                            src={match.teamB.logo}
                          />
                        </div>
                        <span className="[font-family:'Poppins',Helvetica] font-normal text-blackblack-700 text-xl">
                          {match.teamB.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <div className="[font-family:'Poppins',Helvetica] font-normal text-blackblack-700 text-xl">
                        {match.time}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <div className="[font-family:'Poppins',Helvetica] font-normal text-blackblack-700 text-xl">
                        {match.date}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="inline-flex items-center justify-center">
                        {match.players.slice(0, 16).map((player, idx) => (
                          <Avatar key={idx} className={idx > 0 ? "-ml-2" : ""}>
                            <img
                              className="w-6 h-6 object-cover"
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
