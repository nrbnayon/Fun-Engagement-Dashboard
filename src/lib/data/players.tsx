// src/lib/data/players.ts
export interface Player {
  id: string;
  playerImage: string;
  playerName: string;
  jerseyNo: string;
  status: "active" | "inactive" | "pending" | "waiting";
}

// Sample player names and jersey numbers
const samplePlayers = [
  { name: "Kristin Watson", jersey: "11" },
  { name: "Robert Fox", jersey: "10" },
  { name: "Bessie Cooper", jersey: "9" },
  { name: "Annette Black", jersey: "300" },
  { name: "Devon Lane", jersey: "15" },
  { name: "Ralph Edwards", jersey: "3" },
  { name: "Courtney Henry", jersey: "7" },
  { name: "Theresa Webb", jersey: "22" },
  { name: "Eleanor Pena", jersey: "8" },
  { name: "Cameron Williamson", jersey: "14" },
  { name: "Brooklyn Simmons", jersey: "6" },
  { name: "Savannah Nguyen", jersey: "21" },
  { name: "Leslie Alexander", jersey: "19" },
  { name: "Jenny Wilson", jersey: "12" },
  { name: "Dianne Russell", jersey: "18" },
  { name: "Jacob Jones", jersey: "5" },
  { name: "Albert Flores", jersey: "16" },
  { name: "Kathryn Murphy", jersey: "13" },
  { name: "Cody Fisher", jersey: "4" },
  { name: "Marvin McKinney", jersey: "17" },
];

// Sample player images
const sampleImages = [
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
  "/ellipse-2-7.png",
];

const statuses: Player["status"][] = [
  "active",
  "inactive",
  "pending",
  "waiting",
];

export const generatePlayersData = (count: number): Player[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    playerImage: sampleImages[index % sampleImages.length],
    playerName: samplePlayers[index % samplePlayers.length].name,
    jerseyNo: samplePlayers[index % samplePlayers.length].jersey,
    status: statuses[index % statuses.length],
  }));
};
