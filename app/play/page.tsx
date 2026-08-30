import { PlayOptions } from "@/features/game";
import { BlurText } from "@/components/react-bits";

export default function PlayMenuPage() {
  return (
    <main className="min-h-screen bg-cc-bg-page flex flex-col items-center justify-center p-6 text-cc-text-primary">
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <BlurText
          text="Play Chess"
          animateBy="words"
          direction="top"
          className="text-3xl font-extrabold font-sans tracking-tight mb-2 justify-center"
        />
        <p className="text-sm text-cc-text-secondary font-medium mb-6 text-center">
          Choose a mode to start playing
        </p>
        <PlayOptions />
      </div>
    </main>
  );
}
