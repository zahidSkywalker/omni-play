"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Download, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CertificatePage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl(`/api/certificate/${submissionId}`);
    setLoading(false);
  }, [submissionId]);

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/certificate/${submissionId}`);
      if (!res.ok) throw new Error("Failed to download certificate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${submissionId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download certificate");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Certificate
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-4 sm:p-8">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Certificate of Achievement"
                className="w-full h-auto rounded-lg"
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            onClick={handleDownload}
            size="lg"
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
          >
            <Download className="w-5 h-5" />
            Download Certificate (PNG)
          </Button>
        </div>
      </main>
    </div>
  );
}
