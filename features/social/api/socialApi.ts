import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number(),
  image: z.string().nullable().optional(),
});
export type SocialUser = z.infer<typeof userSchema>;

export const requestSchema = z.object({
  incoming: z.array(
    z.object({
      id: z.string(),
      requester: userSchema,
    })
  ),
  outgoing: z.array(
    z.object({
      id: z.string(),
      receiver: userSchema,
    })
  ),
});
export type SocialRequestData = z.infer<typeof requestSchema>;
export type SocialRequest = SocialRequestData["incoming"][0];

export const challengeSchema = z.object({
  id: z.string(),
  timeControl: z.string(),
  colorPref: z.string(),
  sender: userSchema,
});
export type SocialChallenge = z.infer<typeof challengeSchema>;

export const LeaderboardUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  ratingBullet: z.number(),
  ratingBlitz: z.number(),
  ratingRapid: z.number(),
});
export type LeaderboardUser = z.infer<typeof LeaderboardUserSchema>;

export const LeaderboardsDataSchema = z.object({
  bullet: z.array(LeaderboardUserSchema),
  blitz: z.array(LeaderboardUserSchema),
  rapid: z.array(LeaderboardUserSchema),
});
export type LeaderboardsData = z.infer<typeof LeaderboardsDataSchema>;

import { fetchApi } from '@/lib/api-client';

export const socialApi = {
  searchUsers: (query: string) => fetchApi(z.array(userSchema), `/api/users/search?q=${encodeURIComponent(query)}`),
  
  getGlobalLeaderboard: () => fetchApi(LeaderboardsDataSchema, '/api/users/leaderboard/global'),
  
  getFriends: () => fetchApi(z.array(userSchema), '/api/social/friends'),
  
  getRequests: () => fetchApi(requestSchema, '/api/social/requests'),
  
  sendFriendRequest: (userId: string) => fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), `/api/social/friends/request/${userId}`, { method: 'POST' }),
  
  acceptFriendRequest: (requestId: string) => fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), `/api/social/friends/accept/${requestId}`, { method: 'POST' }),
  
  declineFriendRequest: (requestId: string) => fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), `/api/social/friends/request/${requestId}`, { method: 'DELETE' }),
  
  getChallenges: () => fetchApi(z.array(challengeSchema), '/api/social/challenges'),
  
  sendChallenge: (userId: string, data: { timeControl: string, colorPref: string }) => 
    fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), `/api/social/challenge/${userId}`, { method: 'POST', body: JSON.stringify(data) }),
    
  acceptChallenge: (challengeId: string) => 
    fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), `/api/social/challenge/${challengeId}/accept`, { method: 'POST' }),
    
  declineChallenge: (challengeId: string) => 
    fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), `/api/social/challenge/${challengeId}`, { method: 'DELETE' }),
};
