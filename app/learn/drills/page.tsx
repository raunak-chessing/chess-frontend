"use client";

import { Crown, Flag, Shield } from "@phosphor-icons/react";
import { DRILLS, type Drill } from "../../../features/academy/constants/drills";
import { Card } from "../../../components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { OptionCardGrid, type OptionCardItem, type OptionAccent } from "@/components/features/OptionCardGrid";

const CATEGORY_STYLE: Record<Drill["category"], { Icon: typeof Crown; accent: OptionAccent }> = {
  Checkmate: { Icon: Crown, accent: "amber" },
  Endgame: { Icon: Flag, accent: "green" },
  Defense: { Icon: Shield, accent: "blue" },
};

export default function DrillsPage() {
  const items: OptionCardItem[] = DRILLS.map((drill) => ({
    href: `/learn/drills/${drill.id}`,
    Icon: CATEGORY_STYLE[drill.category].Icon,
    title: drill.title,
    description: drill.description,
    accent: CATEGORY_STYLE[drill.category].accent,
    badge: drill.category,
  }));

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 h-full overflow-y-auto">
      <PageHeader title="Drills & Endgame Practice" backHref="/learn" maxWidthClassName="max-w-250" />

      <div className="w-full max-w-[1000px]">
        <Card className="p-8 rounded-3xl mb-8 border-none bg-gradient-to-br from-indigo-900/40 to-slate-900 shadow-2xl">
          <h1 className="text-3xl font-black text-white mb-2">Master the Essentials</h1>
          <p className="text-zinc-400 max-w-xl">
            Practice essential endgames and tactical scenarios against the Stockfish engine.
            Keep playing these positions until you can win them perfectly every time.
          </p>
        </Card>

        <OptionCardGrid items={items} variant="tile" />
      </div>
    </div>
  );
}
