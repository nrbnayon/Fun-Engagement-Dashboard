// src/lib/data/matches.ts - Extract data generation logic
export interface Team {
  name: string;
  logo: string;
}

export interface Match {
  teamA: Team;
  teamB: Team;
  time: string;
  date: string;
  players: string[];
  status?: "upcoming" | "live" | "completed" | "voting";
}

export const generateMatchesData = (count: number): Match[] => {
  const teams: Team[] = [
    { name: "Dumbarton", logo: "/clubcrest--2--1-3.png" },
    { name: "Real Madrid", logo: "/clubcrest--2--1-4.png" },
    { name: "Manchester", logo: "/stowhy8qeoz7mplxkp2kc-1-1.png" },
    { name: "Barcelona", logo: "/clubcrest--2--1-1.png" },
    { name: "Chelsea", logo: "/clubcrest--2--1-2.png" },
  ];

  const times = ["5:00 PM", "7:30 PM", "3:00 PM", "8:00 PM", "6:15 PM"];
  const dates = [
    "12 Jun 2025",
    "13 Jun 2025",
    "14 Jun 2025",
    "15 Jun 2025",
    "16 Jun 2025",
  ];

  const statuses: Match["status"][] = [
    "upcoming",
    "live",
    "completed",
    "voting",
  ];

  return Array.from({ length: count }, (_, index) => ({
    teamA: teams[index % teams.length],
    teamB: teams[(index + 1) % teams.length],
    time: times[index % times.length],
    date: dates[index % dates.length],
    players: Array(16).fill("/ellipse-2-7.png"),
    status: statuses[index % statuses.length],
  }));
};
