export interface ColosseumEventData {
  gameId: string;
  white: { id: string; name: string; rating: number };
  black: { id: string; name: string; rating: number };
  odds: Record<string, number>;
  message: string;
}
