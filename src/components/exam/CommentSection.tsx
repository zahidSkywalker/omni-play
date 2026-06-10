"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  MessageCircle,
  ThumbsUp,
  Send,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

interface Comment {
  _id: string;
  username: string;
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  examId: string;
}

export default function CommentSection({ examId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      const res = await fetch(`/api/exams/${examId}/comments?${params}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [examId, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/exams/${examId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          username: user?.username || "Anonymous",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/exams/${examId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          username: user?.username || "Anonymous",
          parentCommentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post reply");
      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await fetch(`/api/exams/${examId}/comments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, likes: c.likes + 1 } : c
        )
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Discussion</h3>
          <span className="text-xs text-gray-400">({total} comments)</span>
        </div>

        {/* New comment */}
        <div className="flex gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              placeholder="Add a comment..."
              maxLength={2000}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50 text-sm"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Comments list */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No comments yet. Be the first to discuss!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment._id} className="space-y-2">
                {/* Main comment */}
                <div className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-400">
                      {comment.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {comment.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleLike(comment._id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {comment.likes > 0 && comment.likes}
                      </button>
                      <button
                        onClick={() => {
                          if (replyingTo === comment._id) {
                            setReplyingTo(null);
                            setReplyContent("");
                          } else {
                            setReplyingTo(comment._id);
                          }
                        }}
                        className="text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                      >
                        Reply
                      </button>
                      {comment.replies && comment.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                        >
                          {expandedReplies.has(comment._id) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          {comment.replies.length}{" "}
                          {comment.replies.length === 1 ? "reply" : "replies"}
                        </button>
                      )}
                    </div>

                    {/* Reply input */}
                    {replyingTo === comment._id && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleSubmitReply(comment._id)
                          }
                          placeholder="Write a reply..."
                          maxLength={2000}
                          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50 text-xs"
                        />
                        <Button
                          onClick={() => handleSubmitReply(comment._id)}
                          disabled={submitting || !replyContent.trim()}
                          size="sm"
                          className="gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 text-xs px-3"
                        >
                          {submitting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {comment.replies &&
                  comment.replies.length > 0 &&
                  expandedReplies.has(comment._id) && (
                    <div className="ml-11 space-y-2">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply._id}
                          className="flex gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]"
                        >
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-gray-400">
                              {reply.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-gray-300">
                                {reply.username}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/5">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 text-xs"
            >
              Previous
            </Button>
            <span className="text-xs text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 text-xs"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
