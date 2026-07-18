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

export const UserProfileResponseSchema = z.object({
  user: UserSchema,
  recentGames: z.array(z.any()), 
  stats: z.any(),
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
  getProfile: (userId: string) => fetchApi(`/users/${userId}/profile`).then(res => UserProfileResponseSchema.parse(res)),
  getAdvancedInsights: (userId: string) => fetchApi(`/api/users/${userId}/advanced-insights`).then(res => AdvancedInsightsResponseSchema.parse(res)),
  getRatingHistory: (userId: string, timeframe: string = '30d') => 
    fetchApi(`/api/users/${userId}/rating-history?timeframe=${timeframe}`).then(res => RatingHistoryResponseSchema.parse(res)),
  getAchievements: (userId: string) => fetchApi(`/api/users/${userId}/achievements`).then(res => AchievementsResponseSchema.parse(res)),
};
