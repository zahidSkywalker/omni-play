import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard — Learn Tech with Zahid",
  description:
    "See who ranks at the top. Compete with others, track your scores, and climb the leaderboard on Learn Tech with Zahid.",
  openGraph: {
    title: "Leaderboard — Learn Tech with Zahid",
    description: "Compete with others and climb the ranks. View top performers across all exams.",
    url: "https://learn-tech-with-zahid.vercel.app/leaderboard",
    type: "website",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
