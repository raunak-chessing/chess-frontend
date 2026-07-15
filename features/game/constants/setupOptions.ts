import type { GameVariant, GameMode } from "../types/game.types";

export const TIME_CONTROLS = [
  { name: "1 min", value: "1|0", type: "Bullet" },
  { name: "2+1", value: "2|1", type: "Bullet" },
  { name: "3 min", value: "3|0", type: "Blitz" },
  { name: "5 min", value: "5|0", type: "Blitz" },
  { name: "5+3", value: "5|3", type: "Blitz" },
  { name: "10 min", value: "10|0", type: "Rapid" },
  { name: "15+10", value: "15|10", type: "Rapid" },
  { name: "30 min", value: "30|0", type: "Classical" },
  { name: "Unlimited", value: "unlimited", type: "Casual" },
];

export const CHESS_VARIANTS: { id: GameVariant; name: string; icon: string; desc: string }[] = [
  { id: "standard", name: "Standard Chess", icon: "♔", desc: "Traditional rules and setups." },
  { id: "chess960", name: "Chess960", icon: "🌀", desc: "Randomized symmetric back ranks." },
  { id: "three-check", name: "Three-Check", icon: "⚡", desc: "Check your opponent 3 times to win." },
  { id: "king-of-the-hill", name: "King of the Hill", icon: "🏔️", desc: "Race your King to the 4 center squares." },
];

export const COMPUTER_OPPONENTS = [
  { id: 1, name: "Martin", elo: "250", icon: "👶", desc: "Easy" },
  { id: 2, name: "Elara", elo: "800", icon: "👧", desc: "Medium" },
  { id: 3, name: "Alex", elo: "1500", icon: "👨", desc: "Hard" },
  { id: 4, name: "Stockfish", elo: "2500", icon: "🤖", desc: "Master" },
];

export const GAME_MODE_TABS: { id: GameMode; name: string; icon: string }[] = [
  { id: "online", name: "Online", icon: "🌐" },
  { id: "computer-black", name: "Computer", icon: "🤖" },
  { id: "pvp", name: "Pass & Play", icon: "👥" },
];
