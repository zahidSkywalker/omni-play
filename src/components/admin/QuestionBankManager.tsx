"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Search,
  Upload,
  Download,
  Trash2,
  Plus,
  Filter,
  X,
  CheckCircle,
  Circle,
  BookOpen,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationBanner } from "@/components/ui/notification-banner";

const CATEGORIES = [
  "JavaScript", "React", "AI", "Networking", "Database", "Python",
  "TypeScript", "CSS", "Node.js", "DevOps", "General", "Other",
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const DIFF_COLORS: Record<string, string> = {
  beginner: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20",
  intermediate: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20",
  advanced: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20",
};

interface QuestionBankItem {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
}

export default function QuestionBankManager() {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Import states
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add question dialog
  const [showAddForm, setShowAddForm] = useState(false);
  const [addQuestion, setAddQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    category: "JavaScript",
    difficulty: "intermediate",
    tags: "",
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Notification
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter, difficultyFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchQuestions();
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportSuccess(null);
    setImportError(null);
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;

      const format = file.name.endsWith(".csv") ? "csv" : "json";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);

      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setImportSuccess(`Successfully imported ${data.imported} questions (${data.skipped} skipped)`);
      fetchQuestions();
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;

      const params = new URLSearchParams();
      params.set("format", format);
      if (categoryFilter) params.set("category", categoryFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);

      const res = await fetch(`/api/admin/questions/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `question-bank.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;

      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      setNotification({ message: "Question deleted", variant: "success" });
      fetchQuestions();
    } catch {
      setNotification({ message: "Failed to delete question", variant: "error" });
    }
  };

  const handleAddQuestion = async () => {
    if (!addQuestion.question.trim() || addQuestion.options.some((o) => !o.trim())) {
      setAddError("Please fill in the question and all 4 options");
      return;
    }

    setAdding(true);
    setAddError(null);
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...addQuestion,
          tags: addQuestion.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add question");

      setShowAddForm(false);
      setAddQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        category: "JavaScript",
        difficulty: "intermediate",
        tags: "",
      });
      fetchQuestions();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setAdding(false);
    }
  };

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

      {/* Search & Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search questions..."
                className="flex-1 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50"
              />
              <Button
                onClick={handleSearch}
                variant="outline"
                size="sm"
                className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-emerald-500/50"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-emerald-500/50"
              >
                <option value="">All Levels</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>
        <Button
          onClick={() => handleExport("json")}
          variant="outline"
          className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </Button>
        <Button
          onClick={() => handleExport("csv")}
          variant="outline"
          className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
          }}
          className="hidden"
        />

        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {total} questions total
        </span>
      </div>

      {/* Import status */}
      {importing && (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Importing questions...
        </div>
      )}
      {importSuccess && (
        <NotificationBanner
          message={importSuccess}
          variant="success"
          onDismiss={() => setImportSuccess(null)}
        />
      )}
      {importError && (
        <NotificationBanner
          message={importError}
          variant="error"
          onDismiss={() => setImportError(null)}
        />
      )}

      {/* Add Question Form */}
      {showAddForm && (
        <Card className="glass-card border-emerald-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Add New Question
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {addError}
              </div>
            )}

            <textarea
              value={addQuestion.question}
              onChange={(e) => setAddQuestion({ ...addQuestion, question: e.target.value })}
              placeholder="Enter question text..."
              rows={2}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 resize-none"
            />

            <div className="space-y-2">
              {addQuestion.options.map((opt, j) => (
                <div key={j} className="flex items-center gap-2">
                  <button
                    onClick={() => setAddQuestion({ ...addQuestion, correctAnswer: j })}
                    className="flex-shrink-0"
                  >
                    {addQuestion.correctAnswer === j ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500 hover:text-gray-400" />
                    )}
                  </button>
                  <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                    {String.fromCharCode(65 + j)}
                  </span>
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...addQuestion.options];
                      newOpts[j] = e.target.value;
                      setAddQuestion({ ...addQuestion, options: newOpts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + j)}`}
                    className="flex-1 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 text-sm"
                  />
                </div>
              ))}
            </div>

            <Input
              value={addQuestion.explanation}
              onChange={(e) => setAddQuestion({ ...addQuestion, explanation: e.target.value })}
              placeholder="Explanation (optional)..."
              className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 text-sm"
            />

            <div className="flex gap-3">
              <select
                value={addQuestion.category}
                onChange={(e) => setAddQuestion({ ...addQuestion, category: e.target.value })}
                className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-emerald-500/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={addQuestion.difficulty}
                onChange={(e) => setAddQuestion({ ...addQuestion, difficulty: e.target.value })}
                className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-emerald-500/50"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              value={addQuestion.tags}
              onChange={(e) => setAddQuestion({ ...addQuestion, tags: e.target.value })}
              placeholder="Tags (comma-separated, e.g., closures, async)"
              className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 text-sm"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleAddQuestion}
                disabled={adding}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {adding ? "Adding..." : "Add Question"}
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No questions in the bank yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Add questions manually or import from a JSON/CSV file.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q._id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-900 dark:text-white truncate">{q.question}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-white/10">
                        {q.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${DIFF_COLORS[q.difficulty] || ""}`}
                      >
                        {q.difficulty}
                      </Badge>
                      <span className="text-[10px] text-gray-500">
                        Used {q.usageCount} times
                      </span>
                      {q.tags.length > 0 && (
                        <div className="flex gap-1">
                          {q.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                            >
                              {tag}
                            </span>
                          ))}
                          {q.tags.length > 3 && (
                            <span className="text-[10px] text-gray-500">
                              +{q.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDelete(q._id)}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 gap-1.5 bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
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
            className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
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
            className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
