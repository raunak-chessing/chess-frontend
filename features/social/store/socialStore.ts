import { create } from 'zustand';

interface SocialUser {
  id: string;
  name: string;
  rating: number;
  image?: string | null;
}

interface SocialState {
  onlineUsers: Set<string>;
  friends: SocialUser[];
  incomingChallenges: any[];
  incomingRequests: any[];
  isSidebarOpen: boolean;
  
  setOnlineUsers: (userIds: string[]) => void;
  markUserOnline: (userId: string) => void;
  markUserOffline: (userId: string) => void;
  
  setFriends: (friends: SocialUser[]) => void;
  
  addChallenge: (challenge: any) => void;
  removeChallenge: (challengeId: string) => void;
  
  setIncomingRequests: (requests: any[]) => void;
  addIncomingRequest: (request: any) => void;
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
