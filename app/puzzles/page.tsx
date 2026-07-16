import { PuzzleDashboard } from '../../features/puzzles/components/PuzzleDashboard/PuzzleDashboard';

export const metadata = {
  title: 'Puzzles & Tactics - Chessing',
  description: 'Sharpen your chess tactics with endless puzzles and puzzle battles.',
};

export default function PuzzlesRoute() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <PuzzleDashboard />
      </div>
    </div>
  );
}
