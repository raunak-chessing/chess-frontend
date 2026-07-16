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
  { id: 1, name: "Martin", elo: "250", icon: "👶", desc: "Easy", skillLevel: 0, depth: 1, contempt: 0, message: "Hi! I just learned how the pieces move." },
  { id: 2, name: "Elara", elo: "800", icon: "👧", desc: "Medium", skillLevel: 5, depth: 3, contempt: 20, message: "I love attacking the king!" },
  { id: 3, name: "Nelson", elo: "1300", icon: "😎", desc: "Tricky", skillLevel: 10, depth: 6, contempt: 50, message: "Watch out for my Queen." },
  { id: 4, name: "Antonio", elo: "1500", icon: "👴", desc: "Solid", skillLevel: 12, depth: 8, contempt: -10, message: "I prefer a solid, positional game." },
  { id: 5, name: "Isabel", elo: "2000", icon: "🧝‍♀️", desc: "Expert", skillLevel: 16, depth: 12, contempt: 0, message: "Let's have a good game." },
  { id: 6, name: "Stockfish", elo: "3200", icon: "🤖", desc: "Master", skillLevel: 20, depth: 18, contempt: 0, message: "I am an engine. Prepare to lose." },
];

export const GAME_MODE_TABS: { id: GameMode; name: string; icon: string }[] = [
  { id: "online", name: "Online", icon: "🌐" },
  { id: "computer-black", name: "Computer", icon: "🤖" },
  { id: "pvp", name: "Pass & Play", icon: "👥" },
];
