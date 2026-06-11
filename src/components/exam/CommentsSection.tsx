"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, X, MessageSquare, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import LoginModal from "@/components/auth/LoginModal";

interface CommentData {
  _id: string;
  userId?: string;
  username: string;
  content: string;
  likes: number;
  createdAt: string;
  replies: CommentData[];
}

interface CommentsSectionProps {
  examId: string;
}

// ─── Avatar placeholder: colored circle with initial ──────────────
function AvatarPlaceholder({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initial = (name || "A").charAt(0).toUpperCase();
  const colors = [
    "bg-emerald-500/20 text-emerald-400",
    "bg-teal-500/20 text-teal-400",
    "bg-amber-500/20 text-amber-400",
    "bg-cyan-500/20 text-cyan-400",
    "bg-purple-500/20 text-purple-400",
    "bg-rose-500/20 text-rose-400",
  ];
  // Deterministic color based on name
  const colorIdx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const colorClass = colors[colorIdx];

  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 ${sizeClass} ${colorClass}`}
    >
      {initial}
    </span>
  );
}

// ─── Relative time formatter ──────────────────────────────────────
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  return `${diffMonth}mo ago`;
}

export default function CommentsSection({ examId }: CommentsSectionProps) {
  const { user } = useAuth();

  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Initial fetch & page changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch(
          `/api/comments?examId=${examId}&page=${page}&limit=20`
        );
        if (cancelled) return;
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        if (cancelled) return;
        setComments(data.comments);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch comments:", err);
        setError("Failed to load comments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [examId, page]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          content: newComment.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post comment");
      }

      const data = await res.json();
      setNewComment("");
      // Add the new comment at the top
      setComments((prev) => [data.comment, ...prev]);
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      // Remove comment from state
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Discussion</h3>
          <p className="text-xs text-gray-400">
            {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}` : "No comments yet — start the discussion!"}
          </p>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-1">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Be the first to leave a comment!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwnComment = user && comment.userId && user._id === comment.userId;

            return (
              <div
                key={comment._id}
                className="group bg-gray-50 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <AvatarPlaceholder name={comment.username} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {comment.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {relativeTime(comment.createdAt)}
                        </span>
                      </div>
                      {isOwnComment && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          title="Delete comment"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-1.5 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-3 pl-4 border-l border-gray-200/50 dark:border-white/5">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex items-start gap-2">
                            <AvatarPlaceholder name={reply.username} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-300 truncate">
                                  {reply.username}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {relativeTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load more */}
      {page < totalPages && (
        <div className="text-center mb-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="sm"
            disabled={loading}
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Load More Comments
          </Button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* New comment input */}
      {user ? (
        <div className="flex gap-3">
          <AvatarPlaceholder name={user.username} />
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 resize-none text-sm"
              maxLength={2000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handlePostComment();
                }
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-500">
                {newComment.length}/2000 — Press Ctrl+Enter to send
              </span>
              <Button
                onClick={handlePostComment}
                disabled={submitting || !newComment.trim()}
                size="sm"
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/5 rounded-xl p-4 text-center">
          <LogIn className="w-5 h-5 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400 mb-3">
            Login to join the discussion
          </p>
          <Button
            onClick={() => setLoginModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <LogIn className="w-4 h-4" />
            Login / Sign Up
          </Button>
        </div>
      )}

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}
