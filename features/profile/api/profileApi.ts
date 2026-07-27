import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable().optional(),
  rating: z.number(),
  ratingBullet: z.number(),
  ratingBlitz: z.number(),
  ratingRapid: z.number(),
  ratingDaily: z.number(),
  createdAt: z.string(),
});

export const BasicGameSchema = z.object({
  id: z.string(),
  whitePlayerId: z.string(),
  blackPlayerId: z.string(),
  winnerId: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string().optional(),
});

export const ProfileStatsSchema = z.object({
  totalGames: z.number().optional(),
  wins: z.number().optional(),
  losses: z.number().optional(),
  draws: z.number().optional(),
  winRate: z.number().optional(),
});

export const UserProfileResponseSchema = z.object({
  user: UserSchema,
  recentGames: z.array(BasicGameSchema), 
  stats: ProfileStatsSchema,
});
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

export const ColorStatsSchema = z.object({
  wins: z.number(),
  losses: z.number(),
  draws: z.number(),
});

export const AdvancedInsightsResponseSchema = z.object({
  white: ColorStatsSchema,
  black: ColorStatsSchema,
  openings: z.record(z.string(), ColorStatsSchema).nullish().transform(val => val || {}),
  timeOfDay: z.object({
    morning: z.number(),
    afternoon: z.number(),
    evening: z.number(),
    night: z.number(),
  }),
});
export type AdvancedInsightsResponse = z.infer<typeof AdvancedInsightsResponseSchema>;

export const RatingHistoryItemSchema = z.object({
  rating: z.number(),
});
export const RatingHistoryResponseSchema = z.array(RatingHistoryItemSchema);
export type RatingHistoryResponse = z.infer<typeof RatingHistoryResponseSchema>;

export const AchievementSchema = z.object({
  id: z.string(),
  achievement: z.string(),
  unlockedAt: z.string(),
});
export const AchievementsResponseSchema = z.array(AchievementSchema);
export type Achievement = z.infer<typeof AchievementSchema>;

export const profileApi = {
  getProfile: (userId: string) => fetchApi(UserProfileResponseSchema, `/users/${userId}/profile`),
  getAdvancedInsights: (userId: string) => fetchApi(AdvancedInsightsResponseSchema, `/api/users/${userId}/advanced-insights`),
  getRatingHistory: (userId: string, timeframe: string = '30d') => 
    fetchApi(RatingHistoryResponseSchema, `/api/users/${userId}/rating-history?timeframe=${timeframe}`),
  getAchievements: (userId: string) => fetchApi(AchievementsResponseSchema, `/api/users/${userId}/achievements`),
};
