"use client";

import { Download, Award, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CertificateViewProps {
  submissionId: string;
}

export function CertificateView({ submissionId }: CertificateViewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
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
      // Silent fail — user can try again
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Button
        onClick={handleDownload}
        disabled={downloading}
        className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 w-full sm:w-auto"
      >
        {downloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Download Certificate
      </Button>
      <Button
        onClick={() =>
          (window.location.href = `/certificate/${submissionId}`)
        }
        variant="outline"
        className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 w-full sm:w-auto"
      >
        <Award className="w-4 h-4" />
        View Certificate
      </Button>
    </div>
  );
}
