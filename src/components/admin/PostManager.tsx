"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  FileText,
  Eye,
  Search,
  Clock,
  BarChart3,
  Package,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationBanner } from "@/components/ui/notification-banner";

interface PostManagerProps {
  adminToken: string;
}

const TYPES = ["article", "guide", "tutorial", "tip", "lecture", "news"] as const;
const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const TYPE_BADGE: Record<string, string> = {
  article: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/20",
  guide: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20",
  tutorial: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20",
  tip: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20",
  lecture: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/20",
  news: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20",
};

const STATUS_BADGE: Record<string, string> = {
  published: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20",
  draft: "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/20",
};

const DIFF_BADGE: Record<string, string> = {
  beginner: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20",
  intermediate: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20",
  advanced: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20",
};

interface Topic {
  _id: string;
  name: string;
  slug: string;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  topic?: Topic;
  topicSlug?: string;
  topicName?: string;
  type: string;
  difficulty?: string;
  tags?: string[];
  excerpt?: string;
  content?: string;
  isPublished: boolean;
  author?: string;
  publishedAt?: string;
  views?: number;
  readTime?: number;
  createdAt?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function estimateReadTime(content: string): number {
  if (!content) return 0;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const PER_PAGE = 12;

export default function PostManager({ adminToken }: PostManagerProps) {
  // List state
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [topicFilter, setTopicFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form state (create/edit)
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTopicSlug, setFormTopicSlug] = useState("");
  const [formType, setFormType] = useState("article");
  const [formDifficulty, setFormDifficulty] = useState("beginner");
  const [formTagsInput, setFormTagsInput] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formReadTime, setFormReadTime] = useState<number | undefined>(undefined);
  const [formIsPublished, setFormIsPublished] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk seed
  const [showBulkSeed, setShowBulkSeed] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  // Computed read time from content
  const computedReadTime = useMemo(() => estimateReadTime(formContent), [formContent]);
  const displayReadTime = formReadTime ?? computedReadTime;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (topicFilter) params.set("topic", topicFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", String(PER_PAGE));

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
        setTotal(data.total || data.posts.length);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/topics");
      const data = await res.json();
      if (data.topics) setTopics(data.topics);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, topicFilter, typeFilter, statusFilter]);

  const openCreate = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormSlug("");
    setFormTopicSlug("");
    setFormType("article");
    setFormDifficulty("beginner");
    setFormTagsInput("");
    setFormTags([]);
    setFormExcerpt("");
    setFormContent("");
    setFormReadTime(undefined);
    setFormIsPublished(false);
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormTopicSlug(post.topicSlug || post.topic?.slug || "");
    setFormType(post.type || "article");
    setFormDifficulty(post.difficulty || "beginner");
    setFormTags(post.tags || []);
    setFormTagsInput((post.tags || []).join(", "));
    setFormExcerpt(post.excerpt || "");
    setFormContent(post.content || "");
    setFormReadTime(post.readTime);
    setFormIsPublished(post.isPublished);
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const input = formTagsInput.replace(/,/g, "").trim();
      if (input && !formTags.includes(input)) {
        setFormTags([...formTags, input]);
        setFormTagsInput("");
      }
    }
  };

  const handleTagsBlur = () => {
    const parts = formTagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const newTags = [...formTags];
    for (const tag of parts) {
      if (!newTags.includes(tag)) newTags.push(tag);
    }
    setFormTags(newTags);
    setFormTagsInput("");
  };

  const removeTag = (tag: string) => {
    setFormTags(formTags.filter((t) => t !== tag));
  };

  const handleSave = async (publish = false) => {
    if (!formTitle.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!formSlug.trim()) {
      setFormError("Slug is required");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload: Record<string, unknown> = {
        title: formTitle.trim(),
        slug: formSlug.trim(),
        topicSlug: formTopicSlug,
        type: formType,
        difficulty: formDifficulty,
        tags: formTags,
        excerpt: formExcerpt.trim(),
        content: formContent.trim(),
        readTime: formReadTime || computedReadTime || undefined,
        isPublished: publish ? true : formIsPublished,
      };

      const isEdit = !!editingPost;
      const url = isEdit ? `/api/posts/${editingPost.slug}` : "/api/posts";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save post");

      setShowForm(false);
      setNotification({
        message: publish
          ? (isEdit ? "Post updated and published" : "Post published")
          : (isEdit ? "Post updated" : "Draft saved"),
        variant: "success",
      });
      fetchPosts();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteTarget.slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setNotification({ message: "Post deleted", variant: "success" });
      setDeleteTarget(null);
      fetchPosts();
    } catch {
      setNotification({ message: "Failed to delete post", variant: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkSeed = async () => {
    if (!bulkJson.trim()) return;
    setBulkLoading(true);
    try {
      let parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) parsed = [parsed];
      const res = await fetch("/api/admin/posts/bulk-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ posts: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk create failed");
      setNotification({
        message: `Created ${data.count || data.created || parsed.length} posts`,
        variant: "success",
      });
      setShowBulkSeed(false);
      setBulkJson("");
      fetchPosts();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Invalid JSON or request failed",
        variant: "error",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setFormTitle(value);
    if (!editingPost) {
      setFormSlug(slugify(value));
    }
  };

  const selectInputClass =
    "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-emerald-500/50 focus:outline-none";

  const inputClass =
    "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 text-sm";

  // ============================
  // POST FORM (full page within admin)
  // ============================
  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        {/* Notification */}
        {notification && (
          <NotificationBanner
            message={notification.message}
            variant={notification.variant}
            onDismiss={() => setNotification(null)}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingPost ? "Edit Post" : "Create New Post"}
            </h2>
          </div>
          <Button
            onClick={() => setShowForm(false)}
            variant="outline"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>

        {formError && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {formError}
          </div>
        )}

        {/* Title */}
        <Card className="glass-card">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Title</label>
              <Input
                value={formTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title..."
                className={`${inputClass} text-lg font-semibold`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Slug</label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="auto-generated-from-title"
                className={`${inputClass} font-mono text-xs`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="glass-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metadata</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Topic</label>
                <select
                  value={formTopicSlug}
                  onChange={(e) => setFormTopicSlug(e.target.value)}
                  className={`w-full ${selectInputClass}`}
                >
                  <option value="">Select a topic...</option>
                  {topics.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className={`w-full ${selectInputClass}`}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Difficulty</label>
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value)}
                  className={`w-full ${selectInputClass}`}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Read Time (min)</label>
                <Input
                  type="number"
                  value={formReadTime ?? ""}
                  onChange={(e) => setFormReadTime(e.target.value ? Number(e.target.value) : undefined)}
                  min={1}
                  placeholder={String(computedReadTime) || "auto"}
                  className={inputClass}
                />
                <p className="text-[10px] text-gray-400">
                  {computedReadTime > 0 ? `Auto-calculated: ${computedReadTime} min` : "Auto-calculated from content"}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tags</label>
              {formTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}
              <Input
                value={formTagsInput}
                onChange={(e) => setFormTagsInput(e.target.value)}
                onKeyDown={handleTagsKeyDown}
                onBlur={handleTagsBlur}
                placeholder="Type and press Enter or comma to add tags..."
                className={inputClass}
              />
            </div>
          </CardContent>
        </Card>

        {/* Excerpt */}
        <Card className="glass-card">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Excerpt</label>
              <span className={`text-[10px] ${formExcerpt.length > 300 ? "text-red-400" : "text-gray-400"}`}>
                {formExcerpt.length}/300
              </span>
            </div>
            <textarea
              value={formExcerpt}
              onChange={(e) => setFormExcerpt(e.target.value.slice(0, 300))}
              placeholder="Brief summary of the post (shown in listings)..."
              rows={3}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 resize-none"
            />
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="glass-card">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Content (Markdown)</label>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span>{formContent.length} characters</span>
                {computedReadTime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{computedReadTime} min read
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Write your content in Markdown..."
              rows={20}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 resize-y font-mono leading-relaxed min-h-[400px]"
            />
            <p className="text-[10px] text-gray-400">
              Supports: ## Headings, **bold**, *italic*, - lists, `code`, &gt; blockquotes
            </p>
          </CardContent>
        </Card>

        {/* Publish options */}
        <Card className="glass-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Publish Options</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormIsPublished(!formIsPublished)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  formIsPublished
                    ? "bg-emerald-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formIsPublished ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {formIsPublished ? "Published" : "Draft"}
              </span>
              {formIsPublished && (
                <span className="text-xs text-gray-400">
                  — will be published immediately on save
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
            variant="outline"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    );
  }

  // ============================
  // BULK SEED DIALOG
  // ============================
  if (showBulkSeed) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        {notification && (
          <NotificationBanner
            message={notification.message}
            variant={notification.variant}
            onDismiss={() => setNotification(null)}
          />
        )}

        <Card className="glass-card border-emerald-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Bulk Seed Posts
              </h3>
              <button
                onClick={() => setShowBulkSeed(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paste a JSON array of posts to create them in bulk.
            </p>

            <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3">
              <code className="text-[10px] text-gray-400 break-all">
                [{"{"}&quot;title&quot;: &quot;...&quot;, &quot;content&quot;: &quot;...&quot;, &quot;topicSlug&quot;: &quot;...&quot;, &quot;topicName&quot;: &quot;...&quot;, &quot;type&quot;: &quot;article&quot;, &quot;tags&quot;: [&quot;...&quot;], &quot;difficulty&quot;: &quot;beginner&quot;{"}"}]
              </code>
            </div>

            <textarea
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              placeholder='Paste JSON array here...'
              rows={16}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 resize-y font-mono leading-relaxed"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleBulkSeed}
                disabled={bulkLoading || !bulkJson.trim()}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {bulkLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                {bulkLoading ? "Creating..." : "Bulk Create Posts"}
              </Button>
              <Button
                onClick={() => setShowBulkSeed(false)}
                variant="outline"
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================
  // LIST VIEW (default)
  // ============================
  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <NotificationBanner
          message={notification.message}
          variant={notification.variant}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* Filter Bar */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <select
                value={topicFilter}
                onChange={(e) => {
                  setTopicFilter(e.target.value);
                  setPage(1);
                }}
                className={`flex-1 ${selectInputClass}`}
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className={`flex-1 ${selectInputClass}`}
              >
                <option value="">All Types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className={`flex-1 ${selectInputClass}`}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={openCreate}
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="w-4 h-4" />
          Create New Post
        </Button>
        <Button
          onClick={() => setShowBulkSeed(true)}
          variant="outline"
          className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Package className="w-4 h-4" />
          Bulk Seed Posts
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {total} post{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <Card className="glass-card border-red-500/20 animate-fade-in-up">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Delete Post</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete &quot;{deleteTarget.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2 bg-red-500 text-white hover:bg-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                onClick={() => setDeleteTarget(null)}
                variant="outline"
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No posts found.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Create your first post or bulk seed content to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="glass-card hover:border-gray-200 dark:hover:border-white/10 transition-colors animate-fade-in-up"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${TYPE_BADGE[post.type] || TYPE_BADGE.article}`}
                      >
                        {post.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          post.isPublished
                            ? STATUS_BADGE.published
                            : STATUS_BADGE.draft
                        }`}
                      >
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {post.difficulty && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${DIFF_BADGE[post.difficulty] || ""}`}
                        >
                          {post.difficulty}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {post.topic && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {post.topic.name || post.topicName || post.topicSlug}
                        </span>
                      )}
                      {post.author && (
                        <span>{post.author}</span>
                      )}
                      {post.publishedAt && (
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {post.views !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views}
                        </span>
                      )}
                      {post.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime} min
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 4 && (
                          <span className="text-[10px] text-gray-500">
                            +{post.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {post.isPublished && (
                      <Button
                        onClick={() => window.open(`/posts/${post.slug}`, "_blank")}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    )}
                    <Button
                      onClick={() => openEdit(post)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteTarget(post)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
            className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
            className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
