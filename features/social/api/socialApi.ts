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
  searchUsers: (query: string) => fetchApi(`/api/users/search?q=${encodeURIComponent(query)}`).then((res: unknown) => z.array(userSchema).parse(res)),
  
  getGlobalLeaderboard: () => fetchApi('/api/users/leaderboard/global').then(res => LeaderboardsDataSchema.parse(res)),
  
  getFriends: () => fetchApi('/api/social/friends').then((res: unknown) => z.array(userSchema).parse(res)),
  
  getRequests: () => fetchApi('/api/social/requests').then((res: unknown) => requestSchema.parse(res)),
  
  sendFriendRequest: (userId: string) => fetchApi(`/api/social/friends/request/${userId}`, { method: 'POST' }),
  
  acceptFriendRequest: (requestId: string) => fetchApi(`/api/social/friends/accept/${requestId}`, { method: 'POST' }),
  
  declineFriendRequest: (requestId: string) => fetchApi(`/api/social/friends/request/${requestId}`, { method: 'DELETE' }),
  
  getChallenges: () => fetchApi('/api/social/challenges').then((res: unknown) => z.array(challengeSchema).parse(res)),
  
  sendChallenge: (userId: string, data: { timeControl: string, colorPref: string }) => 
    fetchApi(`/api/social/challenge/${userId}`, { method: 'POST', body: JSON.stringify(data) }),
    
  acceptChallenge: (challengeId: string) => 
    fetchApi(`/api/social/challenge/${challengeId}/accept`, { method: 'POST' }),
    
  declineChallenge: (challengeId: string) => 
    fetchApi(`/api/social/challenge/${challengeId}`, { method: 'DELETE' }),
};
