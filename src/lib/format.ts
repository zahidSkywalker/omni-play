export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export function getRankStyle(rank: number): string {
  if (rank === 1) return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
  if (rank === 2) return "bg-gray-300/20 border-gray-300/30 text-gray-300";
  if (rank === 3) return "bg-orange-500/20 border-orange-500/30 text-orange-400";
  return "bg-white/5 border-white/10 text-gray-300";
}
