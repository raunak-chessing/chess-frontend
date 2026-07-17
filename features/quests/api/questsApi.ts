export interface Quest {
  id: string;
  questId: string;
  progress: number;
  target: number;
  completed: boolean;
  expiresAt: string;
}

export const getActiveQuests = async (): Promise<Quest[]> => {
  const response = await fetch('http://localhost:4001/api/quests/active', {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch quests');
  return response.json();
};
