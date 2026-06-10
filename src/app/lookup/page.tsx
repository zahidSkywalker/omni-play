"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Search,
  Clock,
  CheckCircle2,
  ExternalLink,
  Home,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime, getScoreColor } from "@/lib/format";

interface LookupResult {
  submissionId: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  submittedAt: string;
  username: string;
}

interface LookupData {
  username: string;
  token: string;
  results: LookupResult[];
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>}>
      <LookupContent />
    </Suspense>
  );
}

function LookupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preToken = searchParams.get("token") || "";

  const [tokenInput, setTokenInput] = useState(preToken);
  const [searching, setSearching] = useState(false);
  const [data, setData] = useState<LookupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (token?: string) => {
    const t = (token || tokenInput).trim();
    if (!t) return;

    setSearching(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/results/token/${encodeURIComponent(t)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "No results found");
      }
      const result = await res.json();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to lookup");
    } finally {
      setSearching(false);
    }
  };

  // Auto-search if token in URL
  useEffect(() => {
    if (preToken) {
      const id = requestAnimationFrame(() => handleSearch(preToken));
      return () => cancelAnimationFrame(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preToken]);

  const handleCopyToken = async () => {
    if (!data?.token) return;
    try {
      await navigator.clipboard.writeText(data.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-6 pt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Key className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-[family-name:var(--font-cinzel)]">
                <span className="gradient-text">Result Lookup</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Find results with your exam token</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Search box */}
        <div className="mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Find Your Results
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Enter the exam token you received after submitting your exam. Make sure to copy and save it for future reference.
              </p>
              <div className="flex gap-3">
                <Input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="LTWZ-XXXX-XXXX-XXXX"
                  className="flex-1 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50 font-mono uppercase"
                />
                <Button
                  onClick={() => handleSearch()}
                  disabled={searching || !tokenInput.trim()}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6">
            <Card className="bg-red-500/5 border-red-500/20">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {data && (
          <div>
            {/* User info card */}
            <Card className="glass-card border-emerald-500/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Username</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{data.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total Exams</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{data.results.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-background rounded-lg p-3">
                  <Key className="w-4 h-4 text-gray-400" />
                  <code className="text-sm font-mono text-gray-300 flex-1">{data.token}</code>
                  <Button
                    onClick={handleCopyToken}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-400 hover:text-emerald-600 dark:text-emerald-400"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results list */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Exam Results</h3>
            <div className="space-y-4">
              {data.results.map((r, i) => (
                <Card key={r.submissionId} className="glass-card hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">#{i + 1}</span>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{r.examTitle}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {r.correctAnswers}/{r.totalQuestions} correct
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(r.timeTaken)}
                          </span>
                          <span>
                            {new Date(r.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <span className={`text-2xl font-bold ${getScoreColor(r.score)}`}>
                            {r.score}%
                          </span>
                        </div>
                        <Button
                          onClick={() => router.push(`/result/${r.submissionId}`)}
                          variant="outline"
                          size="sm"
                          className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
