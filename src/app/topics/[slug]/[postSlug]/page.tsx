"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Eye, User, BookOpen, Layers,
  Signal, Tag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

interface PostData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  topicSlug: string;
  topicName: string;
  type: string;
  author: string;
  authorRole?: string;
  tags: string[];
  difficulty: string;
  readTime: number;
  isPublished: boolean;
  publishedAt: string | null;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  article: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  guide: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  tutorial: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  tip: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  lecture: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  news: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  beginner: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20", label: "Beginner" },
  intermediate: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/20", label: "Intermediate" },
  advanced: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/20", label: "Advanced" },
};

const TAG_COLORS = [
  "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "bg-rose-500/10 text-rose-400 border-rose-500/15",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/15",
  "bg-pink-500/10 text-pink-400 border-pink-500/15",
  "bg-teal-500/10 text-teal-400 border-teal-500/15",
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function renderMarkdown(content: string) {
  const blocks = content.split("\n\n");
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Heading ## (h2)
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="text-xl font-bold text-gray-100 dark:text-gray-100 mt-10 mb-4 pb-2 border-b border-white/5"
        >
          {trimmed.slice(3)}
        </h2>
      );
    }

    // Heading ### (h3)
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="text-lg font-semibold text-gray-200 dark:text-gray-200 mt-8 mb-3"
        >
          {trimmed.slice(4)}
        </h3>
      );
    }

    // Heading #### (h4)
    if (trimmed.startsWith("#### ")) {
      return (
        <h4
          key={i}
          className="text-base font-semibold text-gray-300 dark:text-gray-300 mt-6 mb-2"
        >
          {trimmed.slice(5)}
        </h4>
      );
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote
          key={i}
          className="border-l-3 border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/5 pl-4 py-3 pr-4 rounded-r-lg my-4 text-gray-300 dark:text-gray-300 italic"
        >
          {trimmed.slice(2)}
        </blockquote>
      );
    }

    // Unordered list
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").filter((line) => line.trim().startsWith("- "));
      return (
        <ul key={i} className="my-4 space-y-1.5 pl-6 list-disc list-outside marker:text-emerald-500/50 marker:text-sm">
          {items.map((item, j) => (
            <li key={j} className="text-gray-300 dark:text-gray-300 leading-relaxed">
              {renderInline(item.trim().slice(2))}
            </li>
          ))}
        </ul>
      );
    }

    // Ordered list
    const orderedMatch = trimmed.match(/^(\d+)\. /);
    if (orderedMatch) {
      const items = trimmed.split("\n").filter((line) => /^\d+\.\s/.test(line.trim()));
      return (
        <ol key={i} className="my-4 space-y-1.5 pl-6 list-decimal list-outside marker:text-emerald-500/50 marker:text-sm">
          {items.map((item, j) => (
            <li key={j} className="text-gray-300 dark:text-gray-300 leading-relaxed">
              {renderInline(item.trim().replace(/^\d+\.\s/, ""))}
            </li>
          ))}
        </ol>
      );
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      return (
        <hr
          key={i}
          className="my-8 border-none h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      );
    }

    // Regular paragraph
    return (
      <p
        key={i}
        className="text-gray-300 dark:text-gray-300 leading-relaxed mb-4 text-[15px]"
      >
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string) {
  // Split by inline code, bold, italic, and links
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (!part) return null;

    // Inline code
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-white/[0.06] text-emerald-400 text-sm font-mono border border-white/5"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-gray-100 dark:text-gray-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={i} className="italic text-gray-200 dark:text-gray-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Link
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 decoration-emerald-500/30 hover:decoration-emerald-500/60 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.postSlug as string;
  const topicSlug = params.slug as string;

  const [post, setPost] = useState<PostData | null>(null);
  const [topicInfo, setTopicInfo] = useState<{ icon: string; color: string } | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<{ title: string; slug: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        // Fetch the post
        const res = await fetch(`/api/posts/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);

          // Fetch topic info for sidebar
          const topicRes = await fetch(`/api/topics/${data.topicSlug}`);
          if (topicRes.ok) {
            const topicData = await topicRes.json();
            setTopicInfo({ icon: topicData.icon, color: topicData.color });
          }
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const topicSlug = post.topicSlug;
    const currentSlug = post.slug;
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/posts?topic=${topicSlug}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          const related = (data.posts || [])
            .filter((p: { slug: string }) => p.slug !== currentSlug)
            .slice(0, 4);
          setRelatedPosts(related);
        }
      } catch {
        // ignore
      }
    }
    fetchRelated();
  }, [post]);

  const color = topicInfo?.color || "emerald";
  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: "bg-blue-500/15", border: "border-blue-500/20", text: "text-blue-400" },
    emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/20", text: "text-emerald-400" },
    teal: { bg: "bg-teal-500/15", border: "border-teal-500/20", text: "text-teal-400" },
    cyan: { bg: "bg-cyan-500/15", border: "border-cyan-500/20", text: "text-cyan-400" },
    purple: { bg: "bg-purple-500/15", border: "border-purple-500/20", text: "text-purple-400" },
    violet: { bg: "bg-violet-500/15", border: "border-violet-500/20", text: "text-violet-400" },
    indigo: { bg: "bg-indigo-500/15", border: "border-indigo-500/20", text: "text-indigo-400" },
    amber: { bg: "bg-amber-500/15", border: "border-amber-500/20", text: "text-amber-400" },
    orange: { bg: "bg-orange-500/15", border: "border-orange-500/20", text: "text-orange-400" },
    red: { bg: "bg-red-500/15", border: "border-red-500/20", text: "text-red-400" },
    rose: { bg: "bg-rose-500/15", border: "border-rose-500/20", text: "text-rose-400" },
    pink: { bg: "bg-pink-500/15", border: "border-pink-500/20", text: "text-pink-400" },
    sky: { bg: "bg-sky-500/15", border: "border-sky-500/20", text: "text-sky-400" },
    lime: { bg: "bg-lime-500/15", border: "border-lime-500/20", text: "text-lime-400" },
    green: { bg: "bg-green-500/15", border: "border-green-500/20", text: "text-green-400" },
    fuchsia: { bg: "bg-fuchsia-500/15", border: "border-fuchsia-500/20", text: "text-fuchsia-400" },
  };
  const c = colorClasses[color] || colorClasses.emerald;
  const TopicIcon = topicInfo ? (ICON_MAP[topicInfo.icon] || BookOpenIcon) : BookOpenIcon;
  const difficulty = DIFFICULTY_STYLES[post?.difficulty || "beginner"] || DIFFICULTY_STYLES.beginner;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <header className="border-b border-border px-4 py-6 pt-8 page-header-gradient">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="shimmer h-4 w-20 rounded bg-gray-100 dark:bg-white/5" />
            </div>
            <div className="max-w-3xl">
              <div className="shimmer h-3 w-16 rounded bg-gray-100 dark:bg-white/5 mb-3" />
              <div className="shimmer h-8 w-3/4 rounded bg-gray-100 dark:bg-white/5 mb-3" />
              <div className="shimmer h-4 w-1/2 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full">
          <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
            <div className="space-y-4 max-w-[720px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="shimmer h-4 w-full rounded bg-gray-100 dark:bg-white/5" />
                  {i % 2 === 0 && <div className="shimmer h-4 w-2/3 rounded bg-gray-100 dark:bg-white/5 mt-2" />}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <header className="border-b border-border px-4 py-6 pt-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Topics
            </Link>
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">Post Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The article you&apos;re looking for doesn&apos;t exist.
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
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <Link
            href={`/topics/${topicSlug}`}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to {post.topicName}
          </Link>

          {/* Article header */}
          <div className="max-w-3xl">
            {/* Type badge */}
            <Badge
              variant="outline"
              className={`mb-4 text-[10px] font-semibold uppercase tracking-wider ${
                TYPE_BADGE_STYLES[post.type] || TYPE_BADGE_STYLES.article
              }`}
            >
              {post.type}
            </Badge>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4 font-[family-name:var(--font-cinzel)]">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="text-gray-300">{post.author}</span>
                {post.authorRole && (
                  <span className="text-xs text-gray-500">• {post.authorRole}</span>
                )}
              </span>
              {post.publishedAt && (
                <span>{formatDate(post.publishedAt)}</span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} min read
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views} views
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          {/* Article body */}
          <article className="max-w-[720px] animate-fade-in-up">
            {/* Content */}
            <div className="prose-custom mb-10">
              {renderMarkdown(post.content)}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-400">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`text-xs ${TAG_COLORS[i % TAG_COLORS.length]}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar — Desktop only */}
          <aside className="hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="sticky top-24 space-y-6">
              {/* Difficulty & Topic card */}
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    About this article
                  </h4>

                  {/* Difficulty */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Signal className="w-3.5 h-3.5" />
                      Difficulty
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}
                    >
                      {difficulty.label}
                    </Badge>
                  </div>

                  {/* Topic link */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Topic
                    </span>
                    <Link
                      href={`/topics/${topicSlug}`}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.text} hover:underline`}
                    >
                      <TopicIcon className="w-3 h-3" />
                      {post.topicName}
                    </Link>
                  </div>

                  {/* Reading time */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Read Time
                    </span>
                    <span className="text-xs text-gray-300">{post.readTime} min</span>
                  </div>

                  {/* Views */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Views
                    </span>
                    <span className="text-xs text-gray-300">{post.views}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <Card className="glass-card overflow-hidden">
                  <CardContent className="p-5 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Related Articles
                    </h4>
                    <div className="space-y-2">
                      {relatedPosts.map((rp) => (
                        <Link
                          key={rp.slug}
                          href={`/topics/${topicSlug}/${rp.slug}`}
                          className="block group"
                        >
                          <div className="text-sm text-gray-300 group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                            {rp.title}
                          </div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                            {rp.type}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Back to topic CTA */}
              <Link href={`/topics/${topicSlug}`} className="block">
                <Card className={`glass-card overflow-hidden transition-all duration-300 ${c.border} hover:border-opacity-60 hover:-translate-y-0.5`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
                      <TopicIcon className={`w-4 h-4 ${c.text}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-200">
                        All {post.topicName} Articles
                      </div>
                      <div className="text-xs text-gray-500">
                        Browse all posts
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
