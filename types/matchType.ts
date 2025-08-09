// Type definitions for API responses
export interface Player {
  id: number;
  image: string;
  jersey_number: number;
  name: string;
  status: string;
  [key: string]: string | number | unknown;
}

export interface Match {
  id: number;
  date?: string;
  selected_players: Player[];
  status: string;
  team_a: string;
  team_b: string;
  team_a_pics?: string;
  team_b_pics?: string;
  time?: string;
  win_name?: string;
  winner?: string;
  date_time?: string;
  [key: string]: string | number | unknown;
}
