"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Send } from "lucide-react";

interface SubmitDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalCount: number;
  isWarning?: boolean;
  warningSeconds?: number;
  isAutoSubmit?: boolean;
}

export default function SubmitDialog({
  open,
  onClose,
  onConfirm,
  answeredCount,
  totalCount,
  isWarning = false,
  warningSeconds,
  isAutoSubmit = false,
}: SubmitDialogProps) {
  const unanswered = totalCount - answeredCount;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isAutoSubmit && onClose()}>
      <DialogContent className="glass-surface text-gray-900 dark:text-white sm:max-w-md">
        <DialogHeader>
          {isWarning ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <DialogTitle className="text-xl">
                  Time Running Out!
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm">
                You have less than {warningSeconds} seconds remaining. Consider submitting your exam now.
              </DialogDescription>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Send className="w-5 h-5 text-emerald-500" />
                </div>
                <DialogTitle className="text-xl">Submit Exam?</DialogTitle>
              </div>
              <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm">
                Review your answers before submitting. This action cannot be undone.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {/* Stats */}
        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Answered</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{answeredCount}</span>
          </div>
          {unanswered > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Unanswered</span>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {unanswered}
              </div>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200/50 dark:border-white/5">
            <span className="text-gray-600 dark:text-gray-400">Total Questions</span>
            <span className="text-gray-900 dark:text-white font-medium">{totalCount}</span>
          </div>
        </div>

        {unanswered > 0 && !isWarning && (
          <p className="text-amber-400/80 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            You have {unanswered} unanswered question{unanswered > 1 ? "s" : ""}. Unanswered questions will be marked as incorrect.
          </p>
        )}

        <DialogFooter className="flex gap-3">
          {!isAutoSubmit && (
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              {isWarning ? "Continue Exam" : "Cancel"}
            </Button>
          )}
          <Button
            onClick={onConfirm}
            className={`flex-1 bg-gradient-to-r ${isAutoSubmit ? "from-red-600 to-orange-600" : "from-emerald-600 to-teal-600"} text-white hover:from-emerald-500 hover:to-teal-500`}
          >
            {isAutoSubmit ? "Auto Submit" : "Submit Exam"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
