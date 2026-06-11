"use client";

import { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  submissionId: string;
  examTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

export default function ShareButtons({
  submissionId,
  examTitle,
  score,
  correctAnswers,
  totalQuestions,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/result/${submissionId}`
      : "";
  const cardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/share/${submissionId}`
      : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    const text = `I scored ${score}% on "${examTitle}" (${correctAnswers}/${totalQuestions} correct)! Can you beat my score?`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  const handleDownloadCard = async () => {
    setDownloading(true);
    try {
      const res = await fetch(cardUrl);
      const contentType = res.headers.get("Content-Type") || "";

      if (contentType.includes("image/png")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `result-${submissionId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // SVG fallback - download as SVG
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `result-${submissionId}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download card error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className="gap-1.5 bg-white/5 border-white/10 text-gray-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy Link
          </>
        )}
      </Button>

      <Button
        onClick={handleTwitterShare}
        variant="outline"
        size="sm"
        className="gap-1.5 bg-white/5 border-white/10 text-gray-300 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/30 hover:text-[#1DA1F2] text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Share on X
      </Button>

      <Button
        onClick={handleDownloadCard}
        variant="outline"
        size="sm"
        disabled={downloading}
        className="gap-1.5 bg-white/5 border-white/10 text-gray-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {downloading ? (
          <>
            <Share2 className="w-3.5 h-3.5 animate-pulse" />
            Generating...
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            Download Card
          </>
        )}
      </Button>
    </div>
  );
}
