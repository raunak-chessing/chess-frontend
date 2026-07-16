"use client";

import { useParams } from "next/navigation";
import { DRILLS } from "../../../../features/academy/constants/drills";
import { DrillSolver } from "../../../../features/academy/components/Drills/DrillSolver";
import Link from "next/link";

export default function DrillItemPage() {
  const params = useParams();
  const id = params?.id as string;
  const drill = DRILLS.find((d) => d.id === id);

  if (!drill) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-white mb-4">Drill not found</h1>
        <Link href="/learn/drills" className="text-cc-green hover:underline">
          Return to Drills
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 h-full overflow-y-auto">
      <DrillSolver drill={drill} />
    </div>
  );
}
