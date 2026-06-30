export interface LeaderEntry {
  alias: string;
  tokens: number;
  ts: number;
  circleId?: string; // Optional: circle ID if submitted within a circle
}

export interface LeaderboardState {
  weekKey: string;
  entries: LeaderEntry[];
  me?: LeaderEntry;
  alias?: string;
  lastSubmitAt?: number;
}

