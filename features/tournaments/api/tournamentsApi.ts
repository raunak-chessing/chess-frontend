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

export const TournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  timeControl: z.string(),
  status: z.string(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  players: z.array(TournamentPlayerSchema).optional(),
}).passthrough();

export const TournamentListSchema = z.array(TournamentSchema);

export type TournamentPlayer = z.infer<typeof TournamentPlayerSchema>;
export type Tournament = z.infer<typeof TournamentSchema>;

export const tournamentsApi = {
  getTournaments: () => fetchApi('/api/tournaments').then(res => TournamentListSchema.parse(res)),
  getTournamentDetails: (id: string) => fetchApi(`/api/tournaments/${id}`).then(res => TournamentSchema.parse(res)),
  joinTournament: (id: string) => fetchApi(`/api/tournaments/${id}/join`, { method: 'POST' }),
  createArena: (data: { name: string, timeControl: string, durationMinutes: number, startsInMinutes: number }) => 
    fetchApi('/api/tournaments/create-arena', { method: 'POST', body: JSON.stringify(data) }),
};
