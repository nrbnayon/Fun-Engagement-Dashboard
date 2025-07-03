// src\lib\data\fanRankData.tsx
// Dummy data its not use when api connect
export interface FanRankingData {
  rank: number;
  name: string;
  email: string;
  points: number;
}

// Generate fan ranking data with varied points and proper ranking
const generateFanRankingData = (count: number): FanRankingData[] => {
  const names = [
    "Kristin Watson",
    "John Doe",
    "Jane Smith",
    "Michael Brown",
    "Sarah Wilson",
    "David Johnson",
    "Emily Davis",
    "Robert Miller",
    "Lisa Anderson",
    "James Wilson",
    "Maria Garcia",
    "William Taylor",
    "Jennifer Thomas",
    "Charles Jackson",
    "Patricia White",
    "Alex Thompson",
    "Rachel Green",
    "Mark Johnson",
    "Laura Davis",
    "Chris Wilson",
    "Amanda Taylor",
    "Brian Miller",
    "Nicole Brown",
    "Kevin Anderson",
    "Michelle White",
    "Steven Garcia",
    "Jessica Thomas",
    "Daniel Jackson",
    "Ashley Martinez",
    "Ryan Rodriguez",
    "Jennifer Lopez",
    "Matthew Gonzalez",
    "Elizabeth Perez",
    "Andrew Torres",
    "Stephanie Rivera",
    "Joshua Cooper",
    "Rebecca Reed",
    "Justin Bailey",
    "Samantha Bell",
    "Brandon Murphy",
    "Melissa Wood",
    "Tyler Brooks",
    "Christina Kelly",
    "Aaron Gray",
    "Kimberly Ward",
    "Nathan Cox",
    "Angela Hughes",
    "Zachary Morris",
    "Heather Rogers",
    "Jeremy Cook",
  ];

  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];

  // Generate random points between 50 and 500
  const fanData = Array.from({ length: count }, (_, index) => {
    const name = names[index % names.length];
    const domain = domains[index % domains.length];
    const email = `${name.toLowerCase().replace(" ", ".")}@${domain}`;
    const points = Math.floor(Math.random() * 451) + 50; // Random points between 50-500

    return {
      name,
      email,
      points,
      rank: 0, // Will be set after sorting
    };
  });

  // Sort by points in descending order and assign ranks
  fanData.sort((a, b) => b.points - a.points);

  // Assign ranks (handle ties by giving same rank)
  let currentRank = 1;
  fanData.forEach((fan, index) => {
    if (index > 0 && fan.points < fanData[index - 1].points) {
      currentRank = index + 1;
    }
    fan.rank = currentRank;
  });

  return fanData;
};

// Export the generated data
export const allFanRankingData = generateFanRankingData(50);
