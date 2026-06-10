"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, BookX, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopicCard from "@/components/topics/TopicCard";

interface Topic {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  examCount: number;
}

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, []);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [topics, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-6 pt-8 page-header-gradient">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-[family-name:var(--font-cinzel)]">
                <span className="gradient-text">Explore Topics</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dive into subjects across science, technology, history, and more
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full">
        {/* Search bar */}
        <div className="mb-8 animate-fade-in-up">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus-visible:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 space-y-4">
                <div className="shimmer w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5" />
                <div className="shimmer h-5 w-3/4 rounded bg-gray-100 dark:bg-white/5" />
                <div className="shimmer h-4 w-full rounded bg-gray-100 dark:bg-white/5" />
                <div className="shimmer h-4 w-2/3 rounded bg-gray-100 dark:bg-white/5" />
                <div className="flex gap-3 mt-4">
                  <div className="shimmer h-4 w-16 rounded bg-gray-100 dark:bg-white/5" />
                  <div className="shimmer h-4 w-12 rounded bg-gray-100 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <BookX className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              {searchQuery ? "No Matching Topics" : "No Topics Yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "Try a different search term."
                : "Topics are being curated. Check back soon!"}
            </p>
          </div>
        ) : (
          /* Topic cards grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic, i) => (
              <TopicCard key={topic.slug} topic={topic} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
