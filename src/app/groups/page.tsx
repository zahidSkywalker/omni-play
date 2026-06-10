"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  Home,
  Search,
  Crown,
  UserCheck,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthProvider";
import type { IGroup } from "@/types";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {text}
        </>
      )}
    </button>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Join dialog state
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
      const res = await fetch(`/api/groups${params}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchGroups();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, fetchGroups]);

  // Handle create group
  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: createName, description: createDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateOpen(false);
        setCreateName("");
        setCreateDesc("");
        fetchGroups();
      } else {
        setCreateError(data.error || "Failed to create group");
      }
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  };

  // Handle join group
  const handleJoin = async () => {
    setJoining(true);
    setJoinError("");
    setJoinSuccess("");
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setJoinSuccess(data.message || "Joined successfully!");
        setJoinCode("");
        fetchGroups();
        setTimeout(() => {
          setJoinOpen(false);
          setJoinSuccess("");
        }, 1500);
      } else {
        setJoinError(data.error || "Failed to join group");
      }
    } catch {
      setJoinError("Network error");
    } finally {
      setJoining(false);
    }
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Groups &amp; Classes
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Login to create or join groups and compete with your classmates on private leaderboards.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Separate groups into "my groups" (teacher) and "joined groups"
  const userId = user?._id || "";
  const myGroups = groups.filter((g) => g.teacherId === userId);
  const joinedGroups = groups.filter((g) => g.teacherId !== userId);

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-6 pt-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-[family-name:var(--font-cinzel)]">
                <span className="gradient-text">Groups &amp; Classes</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Compete with classmates on private boards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setJoinOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Join</span>
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              size="sm"
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Group</span>
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="pl-9 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="shimmer w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="shimmer h-4 w-48 rounded bg-gray-100 dark:bg-white/5" />
                    <div className="shimmer h-3 w-32 rounded bg-gray-100 dark:bg-white/5" />
                  </div>
                  <div className="shimmer h-8 w-16 rounded-lg bg-gray-100 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No Groups Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Create a group as a teacher, or join one with a code to compete on private leaderboards.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => setCreateOpen(true)}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Plus className="w-4 h-4" />
                Create Group
              </Button>
              <Button
                onClick={() => setJoinOpen(true)}
                variant="outline"
                className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <LogIn className="w-4 h-4" />
                Join Group
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* My Groups (Teacher) */}
            {myGroups.length > 0 && (
              <div className="mb-8 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    My Groups
                  </h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({myGroups.length})</span>
                </div>
                <div className="space-y-3">
                  {myGroups.map((group) => (
                    <GroupCard
                      key={group._id}
                      group={group}
                      isTeacher
                      onClick={() => router.push(`/groups/${group._id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Joined Groups */}
            {joinedGroups.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Joined Groups
                  </h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({joinedGroups.length})</span>
                </div>
                <div className="space-y-3">
                  {joinedGroups.map((group) => (
                    <GroupCard
                      key={group._id}
                      group={group}
                      isTeacher={false}
                      onClick={() => router.push(`/groups/${group._id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Group Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="glass-surface max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Create a Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-gray-600 dark:text-gray-300 text-sm">Group Name *</Label>
              <Input
                id="group-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g., CS101 Fall 2025"
                maxLength={200}
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-desc" className="text-gray-600 dark:text-gray-300 text-sm">Description (optional)</Label>
              <Textarea
                id="group-desc"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="What's this group about?"
                maxLength={1000}
                rows={3}
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 resize-none"
              />
            </div>
            {createError && (
              <p className="text-sm text-red-400">{createError}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={!createName.trim() || creating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={joinOpen} onOpenChange={(open) => { setJoinOpen(open); setJoinError(""); setJoinSuccess(""); }}>
        <DialogContent className="glass-surface max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <LogIn className="w-5 h-5 text-emerald-400" />
              Join a Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="join-code" className="text-gray-600 dark:text-gray-300 text-sm">Join Code</Label>
              <Input
                id="join-code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 text-center font-mono text-lg tracking-widest uppercase"
              />
              <p className="text-xs text-gray-500">Enter the 6-character code from your teacher</p>
            </div>
            {joinError && (
              <p className="text-sm text-red-400">{joinError}</p>
            )}
            {joinSuccess && (
              <p className="text-sm text-emerald-400">{joinSuccess}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              onClick={handleJoin}
              disabled={joinCode.length < 4 || joining}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Group Card Sub-component ──────────────────────────────────
function GroupCard({
  group,
  isTeacher,
  onClick,
}: {
  group: IGroup;
  isTeacher: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className="glass-card hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      aria-label={`View ${group.name}`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isTeacher ? "bg-amber-500/10 border border-amber-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
            {isTeacher ? (
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            ) : (
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {group.name}
              </h3>
              {isTeacher && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Teacher
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <CopyButton text={group.code} />
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
              </span>
              <span>
                by {group.teacherName}
              </span>
              <span>
                {formatDate(group.createdAt)}
              </span>
            </div>
            {group.description && (
              <p className="text-xs text-gray-500 mt-1 truncate max-w-md">
                {group.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
