'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f0f2f5' }}>
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.12)',
          }}
        >
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-[#1a1a2e] mb-2">Something went wrong</h2>
        <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
          An unexpected error occurred. This may be a temporary issue.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
          style={{
            background: '#6C84E8',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(108,132,232,0.25)',
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
