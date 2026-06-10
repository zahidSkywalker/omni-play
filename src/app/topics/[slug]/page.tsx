"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Eye, BookOpen, Layers,
  FileText, Lightbulb, GraduationCap, BookMarked, Mic,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cpu, FlaskConical, BookOpen as BookOpenIcon, Landmark, Calculator,
  Code, Shield, Brain, Globe, Server, Lightbulb as LightbulbIcon,
  GraduationCap as GraduationCapIcon, Palette, Music, Languages,
  Dna, Atom, Rocket, Wrench, Database,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Cpu, FlaskConical, BookOpen: BookOpenIcon, Landmark, Calculator,
  Code, Shield, Brain, Globe, Server, Lightbulb: LightbulbIcon,
  GraduationCap: GraduationCapIcon, Palette, Music, Languages,
  Dna, Atom, Rocket, Wrench, Database,
};

interface TopicData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  examCount: number;
  posts: PostItem[];
}

interface PostItem {
  title: string;
  slug: string;
  excerpt: string;
  type: string;
  readTime: number;
  publishedAt: string | null;
  views: number;
}

const TABS = [
  { label: "All", value: "", icon: Layers },
  { label: "Articles", value: "article", icon: FileText },
  { label: "Guides", value: "guide", icon: BookOpen },
  { label: "Tutorials", value: "tutorial", icon: GraduationCap },
  { label: "Tips", value: "tip", icon: Lightbulb },
  { label: "Lectures", value: "lecture", icon: Mic },
];

const TYPE_BADGE_STYLES: Record<string, string> = {
  article: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  guide: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  tutorial: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  tip: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  lecture: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  news: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; hoverBorder: string }> = {
  blue:    { bg: "bg-blue-500/15",    border: "border-blue-500/20",    text: "text-blue-400",    hoverBorder: "hover:border-blue-500/40" },
  emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/20", text: "text-emerald-400", hoverBorder: "hover:border-emerald-500/40" },
  teal:    { bg: "bg-teal-500/15",    border: "border-teal-500/20",    text: "text-teal-400",    hoverBorder: "hover:border-teal-500/40" },
  cyan:    { bg: "bg-cyan-500/15",    border: "border-cyan-500/20",    text: "text-cyan-400",    hoverBorder: "hover:border-cyan-500/40" },
  purple:  { bg: "bg-purple-500/15",  border: "border-purple-500/20",  text: "text-purple-400",  hoverBorder: "hover:border-purple-500/40" },
  violet:  { bg: "bg-violet-500/15",  border: "border-violet-500/20",  text: "text-violet-400",  hoverBorder: "hover:border-violet-500/40" },
  indigo:  { bg: "bg-indigo-500/15",  border: "border-indigo-500/20",  text: "text-indigo-400",  hoverBorder: "hover:border-indigo-500/40" },
  amber:   { bg: "bg-amber-500/15",   border: "border-amber-500/20",   text: "text-amber-400",   hoverBorder: "hover:border-amber-500/40" },
  orange:  { bg: "bg-orange-500/15",  border: "border-orange-500/20",  text: "text-orange-400",  hoverBorder: "hover:border-orange-500/40" },
  red:     { bg: "bg-red-500/15",     border: "border-red-500/20",     text: "text-red-400",     hoverBorder: "hover:border-red-500/40" },
  rose:    { bg: "bg-rose-500/15",    border: "border-rose-500/20",    text: "text-rose-400",    hoverBorder: "hover:border-rose-500/40" },
  pink:    { bg: "bg-pink-500/15",    border: "border-pink-500/20",    text: "text-pink-400",    hoverBorder: "hover:border-pink-500/40" },
  sky:     { bg: "bg-sky-500/15",     border: "border-sky-500/20",     text: "text-sky-400",     hoverBorder: "hover:border-sky-500/40" },
  lime:    { bg: "bg-lime-500/15",    border: "border-lime-500/20",    text: "text-lime-400",    hoverBorder: "hover:border-lime-500/40" },
  green:   { bg: "bg-green-500/15",   border: "border-green-500/20",   text: "text-green-400",   hoverBorder: "hover:border-green-500/40" },
  fuchsia: { bg: "bg-fuchsia-500/15", border: "border-fuchsia-500/20", text: "text-fuchsia-400", hoverBorder: "hover:border-fuchsia-500/40" },
};

const POSTS_PER_PAGE = 10;

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [topic, setTopic] = useState<TopicData | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch topic info
  useEffect(() => {
    async function fetchTopic() {
      try {
        const res = await fetch(`/api/topics/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setTopic(data);
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("Failed to fetch topic:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopic();
  }, [slug]);

  // Fetch posts when tab changes
  useEffect(() => {
    async function fetchPosts() {
      setLoadingMore(true);
      try {
        const queryParts: string[] = [`topic=${slug}`, `page=1`, `limit=${POSTS_PER_PAGE}`];
        if (activeTab) queryParts.push(`type=${activeTab}`);
        const res = await fetch(`/api/posts?${queryParts.join("&")}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setTotalPages(data.totalPages || 1);
          setPage(1);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoadingMore(false);
      }
    }
    fetchPosts();
  }, [slug, activeTab]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const queryParts: string[] = [`topic=${slug}`, `page=${nextPage}`, `limit=${POSTS_PER_PAGE}`];
      if (activeTab) queryParts.push(`type=${activeTab}`);
      const res = await fetch(`/api/posts?${queryParts.join("&")}`);
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [...prev, ...(data.posts || [])]);
        setPage(nextPage);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const color = topic?.color || "emerald";
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.emerald;
  const IconComponent = topic ? (ICON_MAP[topic.icon] || BookOpenIcon) : BookOpenIcon;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <header className="border-b border-border px-4 py-6 pt-8 page-header-gradient">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="shimmer w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5" />
            <div>
              <div className="shimmer h-5 w-48 rounded bg-gray-100 dark:bg-white/5 mb-1" />
              <div className="shimmer h-3 w-32 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
          <div className="space-y-2 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="shimmer h-5 w-16 rounded bg-gray-100 dark:bg-white/5" />
                </div>
                <div className="shimmer h-5 w-3/4 rounded bg-gray-100 dark:bg-white/5" />
                <div className="shimmer h-4 w-full rounded bg-gray-100 dark:bg-white/5" />
                <div className="shimmer h-4 w-2/3 rounded bg-gray-100 dark:bg-white/5" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <header className="border-b border-border px-4 py-6 pt-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topics
            </Link>
            <div className="text-center py-20">
              <Layers className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">Topic Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The topic you&apos;re looking for doesn&apos;t exist.
              </p>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-6 pt-8 page-header-gradient">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Topics
          </Link>

          {/* Topic info */}
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shadow-lg`}
            >
              <IconComponent className={`w-7 h-7 ${c.text}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-[family-name:var(--font-cinzel)]">
                <span className={c.text}>{topic.name}</span>
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">{topic.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? `${c.bg} ${c.text} ${c.border}`
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                <TabIcon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Posts list */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-14 h-14 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Posts Yet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab
                ? `No ${activeTab}s found in this topic.`
                : "Posts are on the way. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <div
                key={post.slug}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Link href={`/topics/${slug}/${post.slug}`}>
                  <Card
                    className={`group glass-card card-hover-gradient overflow-hidden transition-all duration-300 ${c.hoverBorder} hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10`}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        {/* Type badge */}
                        <Badge
                          variant="outline"
                          className={`shrink-0 w-fit text-[10px] font-semibold uppercase tracking-wider ${
                            TYPE_BADGE_STYLES[post.type] || TYPE_BADGE_STYLES.article
                          }`}
                        >
                          {post.type}
                        </Badge>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1.5">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            {post.readTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.readTime} min read
                              </span>
                            )}
                            {post.publishedAt && (
                              <span>{formatDate(post.publishedAt)}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.views || 0}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden sm:flex items-center text-gray-600 dark:text-gray-500 group-hover:text-emerald-500 transition-colors shrink-0">
                          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination — Load more */}
        {page < totalPages && posts.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              variant="outline"
              className={`gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                loadingMore ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loadingMore ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Page {page} of {totalPages} • {posts.length} posts shown
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
