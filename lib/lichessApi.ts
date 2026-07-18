import { z } from "zod";
import { fetchApi } from "./api-client";

export const MasterGameSchema = z.object({
  id: z.string(),
  winner: z.enum(["white", "black", "draw"]).or(z.string().nullable()).optional().transform(val => {
      if (val === "white" || val === "black" || val === "draw") return val;
      return "draw";
  }),
  white: z.object({
    name: z.string(),
    rating: z.number().catch(0),
  }),
  black: z.object({
    name: z.string(),
    rating: z.number().catch(0),
  }),
  year: z.number().catch(0),
});

export type MasterGame = z.infer<typeof MasterGameSchema>;

export const LichessExplorerResponseSchema = z.object({
  opening: z.object({
    name: z.string(),
    eco: z.string().optional(),
  }).optional().nullable(),
  topGames: z.array(MasterGameSchema).optional(),
}).catchall(z.any());

export type LichessExplorerResponse = z.infer<typeof LichessExplorerResponseSchema>;

export const lichessApi = {
  getTopGames: async (fen: string, topGames: number = 5): Promise<MasterGame[]> => {
    try {
      const json = await fetchApi(`/api/openings/top-games?fen=${encodeURIComponent(fen)}&limit=${topGames}`);
      const validated = LichessExplorerResponseSchema.parse(json);
      
      return validated.topGames || [];
    } catch (error) {
      // In production, log via Pino/OpenTelemetry
      return [];
    }
  },
  getOpeningName: async (fen: string): Promise<string | null> => {
    try {
      const json = await fetchApi(`/api/openings/name?fen=${encodeURIComponent(fen)}`);
      if (!json) return null;
      const validated = LichessExplorerResponseSchema.parse(json);
      return validated.opening?.name || null;
    } catch (error) {
      return null;
    }
  }
};
