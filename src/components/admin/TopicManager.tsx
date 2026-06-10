"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Sprout,
  Tag,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationBanner } from "@/components/ui/notification-banner";

interface TopicManagerProps {
  adminToken: string;
}

const ICON_LIST = [
  "Cpu",
  "FlaskConical",
  "BookOpen",
  "Landmark",
  "Calculator",
  "Code",
  "Shield",
  "Brain",
  "Globe",
  "Server",
  "Lightbulb",
  "GraduationCap",
  "Palette",
  "Music",
  "Languages",
  "Dna",
  "Atom",
  "Rocket",
  "Wrench",
  "Database",
] as const;

const COLOR_LIST = [
  "emerald",
  "blue",
  "amber",
  "red",
  "purple",
  "cyan",
  "indigo",
  "rose",
  "teal",
  "orange",
  "lime",
  "pink",
  "violet",
  "sky",
  "fuchsia",
  "yellow",
] as const;

const COLOR_SWATCH: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  cyan: "bg-cyan-500",
  indigo: "bg-indigo-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
  orange: "bg-orange-500",
  lime: "bg-lime-500",
  pink: "bg-pink-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  fuchsia: "bg-fuchsia-500",
  yellow: "bg-yellow-500",
};

const COLOR_TEXT: Record<string, string> = {
  emerald: "text-emerald-500",
  blue: "text-blue-500",
  amber: "text-amber-500",
  red: "text-red-500",
  purple: "text-purple-500",
  cyan: "text-cyan-500",
  indigo: "text-indigo-500",
  rose: "text-rose-500",
  teal: "text-teal-500",
  orange: "text-orange-500",
  lime: "text-lime-500",
  pink: "text-pink-500",
  violet: "text-violet-500",
  sky: "text-sky-500",
  fuchsia: "text-fuchsia-500",
  yellow: "text-yellow-500",
};

const COLOR_BADGE: Record<string, string> = {
  emerald: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20",
  blue: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/20",
  amber: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20",
  red: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20",
  purple: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20",
  cyan: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/20",
  indigo: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/20",
  rose: "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/20",
  teal: "bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-500/20",
  orange: "bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500/20",
  lime: "bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-300 dark:border-lime-500/20",
  pink: "bg-pink-100 dark:bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-300 dark:border-pink-500/20",
  violet: "bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-500/20",
  sky: "bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-500/20",
  fuchsia: "bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-300 dark:border-fuchsia-500/20",
  yellow: "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/20",
};

interface Topic {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  postCount?: number;
  examCount?: number;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LucideIconsMap = LucideIcons as unknown as Record<string, any>;

function IconPreview({ iconName, className }: { iconName: string; className?: string }) {
  const IconComponent = LucideIconsMap[iconName];
  if (!IconComponent) return <BookOpen className={className} />;
  return <IconComponent className={className} />;
}

export default function TopicManager({ adminToken }: TopicManagerProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("BookOpen");
  const [formColor, setFormColor] = useState("emerald");
  const [formOrder, setFormOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Seed
  const [seeding, setSeeding] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/topics");
      const data = await res.json();
      if (data.topics) setTopics(data.topics);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingTopic(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormIcon("BookOpen");
    setFormColor("emerald");
    setFormOrder(topics.length);
    setFormIsActive(true);
    setFormError(null);
    setShowDialog(true);
  };

  const openEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormName(topic.name);
    setFormSlug(topic.slug);
    setFormDescription(topic.description || "");
    setFormIcon(topic.icon);
    setFormColor(topic.color);
    setFormOrder(topic.order);
    setFormIsActive(topic.isActive);
    setFormError(null);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!formSlug.trim()) {
      setFormError("Slug is required");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim(),
        icon: formIcon,
        color: formColor,
        order: formOrder,
        isActive: formIsActive,
      };

      const isEdit = !!editingTopic;
      const url = isEdit ? `/api/topics/${editingTopic.slug}` : "/api/topics";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save topic");

      setShowDialog(false);
      setNotification({
        message: isEdit ? "Topic updated successfully" : "Topic created successfully",
        variant: "success",
      });
      fetchTopics();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save topic");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/topics/${deleteTarget.slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setNotification({ message: "Topic deactivated", variant: "success" });
      setDeleteTarget(null);
      fetchTopics();
    } catch {
      setNotification({ message: "Failed to deactivate topic", variant: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/topics/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      setNotification({ message: `Created ${data.count || data.created} topics`, variant: "success" });
      fetchTopics();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to seed topics",
        variant: "error",
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleNameChange = (value: string) => {
    setFormName(value);
    if (!editingTopic) {
      setFormSlug(slugify(value));
    }
  };

  const selectInputClass =
    "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-emerald-500/50 focus:outline-none";

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

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={openCreate}
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="w-4 h-4" />
          Create New Topic
        </Button>
        <Button
          onClick={handleSeed}
          disabled={seeding}
          variant="outline"
          className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {seeding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sprout className="w-4 h-4" />
          )}
          {seeding ? "Seeding..." : "Seed Default Topics"}
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {topics.length} topic{topics.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <Card className="glass-card border-emerald-500/20 animate-fade-in-up">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {editingTopic ? (
                  <>
                    <Pencil className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Edit Topic
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Create New Topic
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-red-400">{formError}</p>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Name *</label>
              <Input
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., JavaScript Fundamentals"
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 text-sm"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Slug *</label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="auto-generated-from-name"
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 text-sm font-mono"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of the topic..."
                rows={3}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 resize-none"
              />
            </div>

            {/* Icon and Color row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Icon dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  Icon
                  {COLOR_TEXT[formColor] && (
                    <IconPreview iconName={formIcon} className={`w-4 h-4 ${COLOR_TEXT[formColor]}`} />
                  )}
                </label>
                <select
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className={`w-full ${selectInputClass}`}
                >
                  {ICON_LIST.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  Color
                  <span className={`w-3.5 h-3.5 rounded-full ${COLOR_SWATCH[formColor] || "bg-gray-500"}`} />
                </label>
                <select
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className={`w-full ${selectInputClass}`}
                >
                  {COLOR_LIST.map((name) => (
                    <option key={name} value={name}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order and Active */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Order</label>
                <Input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  min={0}
                  className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-emerald-500/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      formIsActive
                        ? "bg-emerald-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formIsActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formIsActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Save buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {saving ? "Saving..." : editingTopic ? "Update Topic" : "Create Topic"}
              </Button>
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <Card className="glass-card border-red-500/20 animate-fade-in-up">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Deactivate Topic</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to deactivate &quot;{deleteTarget.name}&quot;? This will deactivate the topic.
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
                {deleting ? "Deactivating..." : "Deactivate"}
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

      {/* Topics List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No topics created yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Create topics to organize your learning content, or seed default topics to get started quickly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Card
              key={topic._id}
              className="glass-card hover:border-gray-200 dark:hover:border-white/10 transition-colors animate-fade-in-up"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon with color */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      COLOR_BADGE[topic.color] || COLOR_BADGE.emerald
                    }`}>
                      <IconPreview iconName={topic.icon} className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {topic.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] flex-shrink-0 ${
                            topic.isActive
                              ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20"
                              : "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/20"
                          }`}
                        >
                          {topic.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-mono text-gray-400 dark:text-gray-500">
                          /{topic.slug}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${COLOR_SWATCH[topic.color] || "bg-gray-500"}`} />
                          {topic.color}
                        </span>
                        {topic.postCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {topic.postCount} posts
                          </span>
                        )}
                        {topic.examCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                            {topic.examCount} exams
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => openEdit(topic)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteTarget(topic)}
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
    </div>
  );
}
