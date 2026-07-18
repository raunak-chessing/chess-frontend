import { useEffect } from 'react';
import { getSocket } from '@/lib/socket-client';
import { useSocialStore } from '../store/socialStore';
import { SocialChallenge, SocialRequest } from '../api/socialApi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function useSocialSocket() {
  const { markUserOnline, markUserOffline, addChallenge, addIncomingRequest } = useSocialStore();
  const router = useRouter();

  useEffect(() => {
    const onUserOnline = (data: { userId: string }) => markUserOnline(data.userId);
    const onUserOffline = (data: { userId: string }) => markUserOffline(data.userId);
    
    const onChallengeReceived = (challenge: SocialChallenge) => {
      addChallenge(challenge);
      toast.success(`${challenge.sender.name} challenged you to a ${challenge.timeControl} game!`);
    };
    
    const onChallengeAccepted = (data: { challengeId: string, gameId: string }) => {
      toast.success('Challenge accepted! Redirecting to game...');
      router.push(`/play/online?gameId=${data.gameId}`);
    };
    
    const onFriendRequestReceived = (request: SocialRequest) => {
      addIncomingRequest(request);
      toast.success('New friend request received!');
    };

    const socket = getSocket();

    socket.on('userOnline', onUserOnline);
    socket.on('userOffline', onUserOffline);
    socket.on('challengeReceived', onChallengeReceived);
    socket.on('challengeAccepted', onChallengeAccepted);
    socket.on('friendRequestReceived', onFriendRequestReceived);

    return () => {
      socket.off('userOnline', onUserOnline);
      socket.off('userOffline', onUserOffline);
      socket.off('challengeReceived', onChallengeReceived);
      socket.off('challengeAccepted', onChallengeAccepted);
      socket.off('friendRequestReceived', onFriendRequestReceived);
    };
  }, [markUserOnline, markUserOffline, addChallenge, addIncomingRequest, router]);
}
