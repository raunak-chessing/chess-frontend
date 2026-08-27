import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const TournamentPlayerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  score: z.number(),
  streak: z.number(),
  rank: z.number().optional(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    rating: z.number(),
  })
}).passthrough();

export const TournamentRoundSchema = z.object({
  roundNumber: z.number(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
}).passthrough();

export const TournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  timeControl: z.string(),
  status: z.string(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  maxRounds: z.number().optional().nullable(),
  players: z.array(TournamentPlayerSchema).optional(),
  rounds: z.array(TournamentRoundSchema).optional(),
}).passthrough();

export const TournamentListSchema = z.array(TournamentSchema);

export const TournamentPairingSchema = z.object({
  id: z.string(),
  roundNumber: z.number(),
  whitePlayerId: z.string(),
  blackPlayerId: z.string().nullable(),
  gameId: z.string().nullable(),
  isBye: z.boolean(),
  result: z.string().nullable(),
  whitePlayer: z.object({ id: z.string(), name: z.string(), rating: z.number() }),
  blackPlayer: z.object({ id: z.string(), name: z.string(), rating: z.number() }).nullable(),
}).passthrough();

export const TournamentPairingListSchema = z.array(TournamentPairingSchema);
export const StandingsSchema = z.array(TournamentPlayerSchema);

export type TournamentPlayer = z.infer<typeof TournamentPlayerSchema>;
export type Tournament = z.infer<typeof TournamentSchema>;
export type TournamentPairing = z.infer<typeof TournamentPairingSchema>;

export const tournamentsApi = {
  getTournaments: () => fetchApi(TournamentListSchema, '/api/tournaments'),
  getTournamentDetails: (id: string) => fetchApi(TournamentSchema, `/api/tournaments/${id}`),
  joinTournament: (id: string) => fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), `/api/tournaments/${id}/join`, { method: 'POST' }),
  createArena: (data: { name: string, timeControl: string, durationMinutes: number, startsInMinutes: number }) =>
    fetchApi(z.object({ success: z.boolean().optional(), id: z.string().optional() }).passthrough(), '/api/tournaments/create-arena', { method: 'POST', body: JSON.stringify(data) }),
  createSwiss: (data: { name: string, timeControl: string, maxRounds: number, startsInMinutes: number }) =>
    fetchApi(z.object({ success: z.boolean().optional(), id: z.string().optional() }).passthrough(), '/api/tournaments/create-swiss', { method: 'POST', body: JSON.stringify(data) }),
  getStandings: (id: string) => fetchApi(StandingsSchema, `/api/tournaments/${id}/standings`),
  getPairings: (id: string, round: number) => fetchApi(TournamentPairingListSchema, `/api/tournaments/${id}/pairings/${round}`),
};
