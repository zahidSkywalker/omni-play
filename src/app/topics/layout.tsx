import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Topics — Learn Tech with Zahid",
  description:
    "Browse articles, guides, tutorials, and lectures across Web Development, AI, Cybersecurity, DevOps, Science, and more.",
  openGraph: {
    title: "Explore Topics — Learn Tech with Zahid",
    description: "Dive into subjects across technology, science, history, and more.",
    url: "https://learn-tech-with-zahid.vercel.app/topics",
    type: "website",
  },
};

export default function TopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
