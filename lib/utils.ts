export function formatTime(timeInSecs: number): string {
  const mins = Math.floor(timeInSecs / 60);
  const secs = timeInSecs % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function playSound(url: string): void {
  new Audio(url).play().catch(() => {});
}
