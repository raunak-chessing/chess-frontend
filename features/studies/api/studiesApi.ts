import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  pgn: z.string().optional(),
  fen: z.string().optional(),
  annotations: z.array(z.any()).optional(),
}).passthrough();

export const StudySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  chapters: z.array(ChapterSchema).optional(),
  createdAt: z.string().optional(),
  owner: z.object({ name: z.string(), rating: z.number().optional() }).optional(),
  _count: z.object({ chapters: z.number().optional() }).optional(),
}).passthrough();

export const StudyListSchema = z.array(StudySchema);

export type Chapter = z.infer<typeof ChapterSchema>;
export type Study = z.infer<typeof StudySchema>;

export const studiesApi = {
  getStudies: () => fetchApi('/api/studies').then(res => StudyListSchema.parse(res)),
  getMyStudies: () => fetchApi('/api/studies/my').then(res => StudyListSchema.parse(res)),
  getStudy: (id: string) => fetchApi(`/api/studies/${id}`).then(res => StudySchema.parse(res)),
  createStudy: (data: { title: string, description?: string, isPublic?: boolean }) => 
    fetchApi('/api/studies', { method: 'POST', body: JSON.stringify(data) }).then(res => StudySchema.parse(res)),
  addChapter: (studyId: string, title: string) => 
    fetchApi(`/api/studies/${studyId}/chapters`, { method: 'POST', body: JSON.stringify({ title }) }).then(res => ChapterSchema.parse(res)),
  updateChapter: (chapterId: string, data: Partial<Pick<Chapter, "title" | "pgn" | "fen" | "annotations">>) => 
    fetchApi(`/api/studies/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(data) }).then(res => ChapterSchema.parse(res)),
};
