import { ArenaLobby } from '@/features/tournaments/components/ArenaLobby';

export default function TournamentArenaPage({ params }: { params: { tournamentId: string } }) {
  return <ArenaLobby tournamentId={params.tournamentId} />;
}
