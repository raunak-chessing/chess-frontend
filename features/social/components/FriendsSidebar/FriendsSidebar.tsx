'use client';

import React, { useEffect, useState } from 'react';
import { Users, X, Swords, UserPlus, Search } from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import { socialApi } from '../../api/socialApi';
import { useSocialSocket } from '../../hooks/useSocialSocket';
import { toast } from 'react-hot-toast';

export function FriendsSidebar() {
  const { isSidebarOpen, toggleSidebar, friends, setFriends, onlineUsers, incomingChallenges, incomingRequests, setIncomingRequests, removeIncomingRequest } = useSocialStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useSocialSocket();

  useEffect(() => {
    if (isSidebarOpen) {
      setLoading(true);
      Promise.all([
        socialApi.getFriends().then(setFriends),
        socialApi.getRequests().then(reqs => setIncomingRequests(reqs.incoming))
      ]).catch(err => console.error(err)).finally(() => setLoading(false));
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isSidebarOpen, setFriends]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      socialApi.searchUsers(searchQuery)
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleChallenge = async (friendId: string) => {
    try {
      await socialApi.sendChallenge(friendId, { timeControl: '10|0', colorPref: 'random' });
      toast.success('Challenge sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send challenge');
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      await socialApi.acceptChallenge(challengeId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept challenge');
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await socialApi.sendFriendRequest(userId);
      toast.success('Friend request sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await socialApi.acceptFriendRequest(requestId);
      removeIncomingRequest(requestId);
      toast.success('Friend request accepted!');
      // Refresh friends list
      socialApi.getFriends().then(setFriends);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await socialApi.declineFriendRequest(requestId);
      removeIncomingRequest(requestId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to decline friend request');
    }
  };

  if (!isSidebarOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-surface border-l border-surface-highlight shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-surface-highlight">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Friends
        </h2>
        <button onClick={toggleSidebar} className="text-text-secondary hover:text-text-primary transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-surface-highlight">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Add friend by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-highlight text-sm text-text-primary pl-9 pr-3 py-2 rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {searchQuery.length >= 2 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Search Results</h3>
            {searching ? (
              <div className="text-sm text-text-secondary text-center py-2">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-sm text-text-secondary text-center py-2">No users found.</div>
            ) : (
              searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-surface-highlight rounded-lg transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-text-primary font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-primary">{user.name}</span>
                      <span className="text-xs text-text-secondary">Elo: {user.rating}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddFriend(user.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-primary transition-all bg-surface rounded-md"
                    title="Send Friend Request"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              ))
            )}
            <hr className="border-surface-highlight my-4" />
          </div>
        )}

        {incomingRequests.length > 0 && !searchQuery && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Friend Requests</h3>
            {incomingRequests.map(req => (
              <div key={req.id} className="bg-surface-highlight rounded-lg p-3 flex flex-col gap-2">
                <div className="text-sm text-text-primary">
                  <span className="font-semibold">{req.requester.name}</span> sent a friend request
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAcceptRequest(req.id)}
                    className="flex-1 bg-primary text-white text-xs font-semibold py-1.5 rounded hover:bg-primary-hover transition-colors"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleDeclineRequest(req.id)}
                    className="flex-1 bg-surface text-text-secondary hover:text-text-primary border border-surface-highlight text-xs font-semibold py-1.5 rounded transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {incomingChallenges.length > 0 && !searchQuery && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Incoming Challenges</h3>
            {incomingChallenges.map(challenge => (
              <div key={challenge.id} className="bg-surface-highlight rounded-lg p-3 flex flex-col gap-2">
                <div className="text-sm text-text-primary">
                  <span className="font-semibold">{challenge.sender.name}</span> wants to play {challenge.timeControl}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAcceptChallenge(challenge.id)}
                    className="flex-1 bg-primary text-white text-xs font-semibold py-1.5 rounded hover:bg-primary-hover transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searchQuery && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">All Friends</h3>
          {loading ? (
            <div className="text-sm text-text-secondary text-center py-4">Loading...</div>
          ) : friends.length === 0 ? (
            <div className="text-sm text-text-secondary text-center py-4">No friends yet.</div>
          ) : (
            friends.map(friend => {
              const isOnline = onlineUsers.has(friend.id);
              return (
                <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-surface-highlight rounded-lg transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-text-primary font-bold">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-primary">{friend.name}</span>
                      <span className="text-xs text-text-secondary">Elo: {friend.rating}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleChallenge(friend.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-primary transition-all bg-surface rounded-md"
                    title="Challenge"
                  >
                    <Swords size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
        )}
      </div>
    </div>
  );
}
