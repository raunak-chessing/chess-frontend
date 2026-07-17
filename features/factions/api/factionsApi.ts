export interface Faction {
  id: string;
  name: string;
  description: string;
  colorTheme: string;
  totalScore: number;
  _count?: {
    users: number;
  };
}

export const getFactions = async (): Promise<Faction[]> => {
  const response = await fetch('http://localhost:4001/api/factions', {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch factions');
  return response.json();
};

export const joinFaction = async (factionId: string): Promise<void> => {
  const response = await fetch('http://localhost:4001/api/factions/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ factionId }),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to join faction');
};
