import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number(),
  image: z.string().nullable().optional(),
});

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

export const challengeSchema = z.object({
  id: z.string(),
  timeControl: z.string(),
  colorPref: z.string(),
  sender: userSchema,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw { response: { data: error } };
  }
  return res.json();
}

export const socialApi = {
  searchUsers: (query: string) => fetchApi(`/api/users/search?q=${encodeURIComponent(query)}`).then((res: any) => z.array(userSchema).parse(res)),
  
  getFriends: () => fetchApi('/api/social/friends').then((res: any) => z.array(userSchema).parse(res)),
  
  getRequests: () => fetchApi('/api/social/requests').then((res: any) => requestSchema.parse(res)),
  
  sendFriendRequest: (userId: string) => fetchApi(`/api/social/friends/request/${userId}`, { method: 'POST' }),
  
  acceptFriendRequest: (requestId: string) => fetchApi(`/api/social/friends/accept/${requestId}`, { method: 'POST' }),
  
  declineFriendRequest: (requestId: string) => fetchApi(`/api/social/friends/request/${requestId}`, { method: 'DELETE' }),
  
  getChallenges: () => fetchApi('/api/social/challenges').then((res: any) => z.array(challengeSchema).parse(res)),
  
  sendChallenge: (userId: string, data: { timeControl: string, colorPref: string }) => 
    fetchApi(`/api/social/challenge/${userId}`, { method: 'POST', body: JSON.stringify(data) }),
    
  acceptChallenge: (challengeId: string) => 
    fetchApi(`/api/social/challenge/${challengeId}/accept`, { method: 'POST' }),
    
  declineChallenge: (challengeId: string) => 
    fetchApi(`/api/social/challenge/${challengeId}`, { method: 'DELETE' }),
};
