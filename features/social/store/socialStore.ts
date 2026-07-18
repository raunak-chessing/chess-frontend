import { create } from 'zustand';
import { socialApi, SocialChallenge, SocialRequest, SocialRequestData } from '../api/socialApi';

interface SocialUser {
  id: string;
  name: string;
  rating: number;
  image?: string | null;
}

interface SocialState {
  onlineUsers: Set<string>;
  friends: SocialUser[];
  incomingChallenges: SocialChallenge[];
  incomingRequests: SocialRequest[];
  isSidebarOpen: boolean;
  
  setOnlineUsers: (userIds: string[]) => void;
  markUserOnline: (userId: string) => void;
  markUserOffline: (userId: string) => void;
  
  setFriends: (friends: SocialUser[]) => void;
  
  addChallenge: (challenge: SocialChallenge) => void;
  removeChallenge: (challengeId: string) => void;
  
  setIncomingRequests: (requests: SocialRequest[]) => void;
  addIncomingRequest: (request: SocialRequest) => void;
  removeIncomingRequest: (requestId: string) => void;
  
  toggleSidebar: () => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  onlineUsers: new Set<string>(),
  friends: [],
  incomingChallenges: [],
  incomingRequests: [],
  isSidebarOpen: false,
  
  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
  markUserOnline: (userId) => set((state) => {
    const newSet = new Set(state.onlineUsers);
    newSet.add(userId);
    return { onlineUsers: newSet };
  }),
  markUserOffline: (userId) => set((state) => {
    const newSet = new Set(state.onlineUsers);
    newSet.delete(userId);
    return { onlineUsers: newSet };
  }),
  
  setFriends: (friends) => set({ friends }),
  
  addChallenge: (challenge) => set((state) => ({
    incomingChallenges: [...state.incomingChallenges, challenge]
  })),
  removeChallenge: (challengeId) => set((state) => ({
    incomingChallenges: state.incomingChallenges.filter(c => c.id !== challengeId)
  })),
  
  setIncomingRequests: (incomingRequests) => set({ incomingRequests }),
  addIncomingRequest: (request) => set((state) => ({
    incomingRequests: [...state.incomingRequests, request]
  })),
  removeIncomingRequest: (requestId) => set((state) => ({
    incomingRequests: state.incomingRequests.filter(r => r.id !== requestId)
  })),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
