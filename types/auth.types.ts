export interface ChessUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  rating: number;
  ratingBullet: number;
  rdBullet: number;
  ratingBlitz: number;
  rdBlitz: number;
  ratingRapid: number;
  rdRapid: number;
  ratingDaily: number;
  rdDaily: number;
  ratingPuzzle: number;
  country?: string | null;
  factionId?: string | null;
  lastActiveBullet?: Date | null;
  lastActiveBlitz?: Date | null;
  lastActiveRapid?: Date | null;
  lastActiveDaily?: Date | null;
}
