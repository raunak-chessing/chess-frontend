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

export const tournamentsApi = {
  getTournaments: () => fetchApi('/api/tournaments'),
  getTournamentDetails: (id: string) => fetchApi(`/api/tournaments/${id}`),
  joinTournament: (id: string) => fetchApi(`/api/tournaments/${id}/join`, { method: 'POST' }),
  createArena: (data: { name: string, timeControl: string, durationMinutes: number, startsInMinutes: number }) => 
    fetchApi('/api/tournaments/create-arena', { method: 'POST', body: JSON.stringify(data) }),
};
