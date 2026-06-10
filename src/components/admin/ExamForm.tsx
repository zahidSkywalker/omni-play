"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  CheckCircle,
  Circle,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import type { IQuestion } from "@/types";
import { NotificationBanner } from "@/components/ui/notification-banner";

interface ExamFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    duration: number;
    questions: IQuestion[];
  }) => void;
  loading: boolean;
}

export default function ExamForm({ onSubmit, loading }: ExamFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<IQuestion[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ]);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const updateQuestion = (index: number, field: keyof IQuestion, value: unknown) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options];
      opts[oIndex] = value;
      copy[qIndex] = { ...copy[qIndex], options: opts };
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === questions.length - 1) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [copy[index], copy[targetIndex]] = [copy[targetIndex], copy[index]];
      return copy;
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) {
        setUploadError("Admin session not found. Please log in from the admin page.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/parse-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse file");
      }

      if (data.questions && data.questions.length > 0) {
        setQuestions(
          data.questions.map((q: Record<string, unknown>) => ({
            question: String(q.question || ""),
            options: Array.isArray(q.options) && q.options.length === 4 ? q.options.map(String) : ["", "", "", ""],
            correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
            explanation: String(q.explanation || ""),
          }))
        );
        setUploadSuccess(
          `Successfully parsed ${data.questionCount} questions from "${file.name}". Review and adjust below.`
        );
      } else {
        throw new Error("No questions could be extracted from the file.");
      }
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to parse file"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = () => {
    // Basic validation
    const hasEmpty = questions.some(
      (q) =>
        !q.question.trim() ||
        q.options.some((o) => !o.trim())
    );
    if (hasEmpty || !title.trim() || !description.trim()) {
      setFormError("Please fill in all required fields (title, description, all questions with their options).");
      return;
    }
    setFormError(null);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      duration,
      questions,
    });
  };

  return (
    <div className="space-y-6">
      {/* Form validation error */}
      {formError && (
        <NotificationBanner
          message={formError}
          variant="warning"
          onDismiss={() => setFormError(null)}
        />
      )}

      {/* File Upload Section */}
      <Card className="glass-card border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Quick Import — Upload Question Paper
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Upload a PDF, DOCX, or TXT file with MCQ questions. Questions will be auto-detected and filled below.
            Supported format: numbered questions (1, 2, 3...) with options (A, B, C, D) and answer keys.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              dragOver
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                <span className="text-gray-700 dark:text-gray-300">Parsing questions...</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOCX, or TXT
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{uploadError}</p>
              </div>
              <button onClick={() => setUploadError(null)} className="text-gray-400 hover:text-gray-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
              <FileText className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-emerald-600 dark:text-emerald-400">{uploadSuccess}</p>
              </div>
              <button onClick={() => setUploadSuccess(null)} className="text-gray-400 hover:text-gray-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam Details */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Exam Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., JavaScript Fundamentals Exam"
              className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the exam..."
              rows={3}
              className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <div className="flex gap-3">
              {[15, 30, 45, 60, 90, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    duration === d
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Questions: {questions.length}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <Card
            key={i}
            className="glass-card"
          >
            <CardContent className="p-6">
              {/* Question header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Q{i + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveQuestion(i, "up")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveQuestion(i, "down")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeQuestion(i)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question text */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Question Text *
                </label>
                <Textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(i, "question", e.target.value)}
                  placeholder="Enter the question..."
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50 resize-none text-sm"
                />
              </div>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {q.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuestion(i, "correctAnswer", j)}
                      className="flex-shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full"
                      title="Set as correct answer"
                    >
                      {q.correctAnswer === j ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 hover:text-gray-400" />
                      )}
                    </button>
                    <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-500 dark:text-gray-400">
                      {String.fromCharCode(65 + j)}
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(i, j, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + j)}`}
                      className="flex-1 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 text-sm h-9"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation (optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Explanation (optional)
                </label>
                <Input
                  value={q.explanation || ""}
                  onChange={(e) =>
                    updateQuestion(i, "explanation", e.target.value)
                  }
                  placeholder="Why this answer is correct..."
                  className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 text-sm h-9"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add question button */}
      <Button
        onClick={addQuestion}
        variant="outline"
        className="w-full gap-2 bg-white/5 border-gray-200 dark:border-white/10 border-dashed text-gray-600 dark:text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </Button>

      {/* Submit */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {loading ? "Creating..." : `Create Exam (${questions.length} questions)`}
        </Button>
      </div>
    </div>
  );
}
