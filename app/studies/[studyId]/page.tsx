import { StudyEditor } from '@/features/studies/components/StudyEditor';

export default function StudyEditorPage({ params }: { params: { studyId: string } }) {
  return <StudyEditor studyId={params.studyId} />;
}
