import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const AnnotationSchema = z.object({
  type: z.string(), // "arrow" | "circle" | "highlight"
  square: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  color: z.string().optional(),
  comment: z.string().optional(),
}).passthrough();

export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  pgn: z.string().optional(),
  fen: z.string().optional(),
  annotations: z.array(AnnotationSchema).optional(),
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
  getStudies: () => fetchApi(StudyListSchema, '/api/studies'),
  getMyStudies: () => fetchApi(StudyListSchema, '/api/studies/my'),
  getStudy: (id: string) => fetchApi(StudySchema, `/api/studies/${id}`),
  createStudy: (data: { title: string, description?: string, isPublic?: boolean }) => 
    fetchApi(StudySchema, '/api/studies', { method: 'POST', body: JSON.stringify(data) }),
  addChapter: (studyId: string, title: string) => 
    fetchApi(ChapterSchema, `/api/studies/${studyId}/chapters`, { method: 'POST', body: JSON.stringify({ title }) }),
  updateChapter: (chapterId: string, data: Partial<Pick<Chapter, "title" | "pgn" | "fen" | "annotations">>) => 
    fetchApi(ChapterSchema, `/api/studies/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(data) }),
};
