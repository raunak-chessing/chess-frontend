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

export const studiesApi = {
  getStudies: () => fetchApi('/api/studies'),
  getMyStudies: () => fetchApi('/api/studies/my'),
  getStudy: (id: string) => fetchApi(`/api/studies/${id}`),
  createStudy: (data: { title: string, description?: string, isPublic?: boolean }) => 
    fetchApi('/api/studies', { method: 'POST', body: JSON.stringify(data) }),
  addChapter: (studyId: string, title: string) => 
    fetchApi(`/api/studies/${studyId}/chapters`, { method: 'POST', body: JSON.stringify({ title }) }),
  updateChapter: (chapterId: string, data: any) => 
    fetchApi(`/api/studies/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(data) }),
};
