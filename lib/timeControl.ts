export type TimeControlCategory = "Bullet" | "Blitz" | "Rapid" | "Daily";

export function classifyTimeControl(tc: string): TimeControlCategory {
  if (tc.toLowerCase().includes("day")) return "Daily";

  const parts = tc.split(/[|+]/);
  const baseMinutes = parseFloat(parts[0]);
  if (parts.length === 0 || isNaN(baseMinutes)) return "Rapid";

  const incrementSeconds = parts.length > 1 ? parseFloat(parts[1]) : 0;
  const totalSeconds = baseMinutes * 60 + 40 * (isNaN(incrementSeconds) ? 0 : incrementSeconds);

  if (totalSeconds < 180) return "Bullet";
  if (totalSeconds < 600) return "Blitz";
  return "Rapid";
}
