"use client";

import { X, AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBannerProps {
  message: string;
  variant?: "error" | "warning" | "success" | "info";
  onDismiss?: () => void;
  className?: string;
}

const variantConfig = {
  error: {
    borderColor: "border-l-red-500",
    bg: "bg-red-100 dark:bg-red-500/10",
    icon: AlertCircle,
    iconColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-700 dark:text-red-300",
  },
  warning: {
    borderColor: "border-l-amber-500",
    bg: "bg-amber-100 dark:bg-amber-500/10",
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  success: {
    borderColor: "border-l-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  info: {
    borderColor: "border-l-cyan-500",
    bg: "bg-cyan-100 dark:bg-cyan-500/10",
    icon: Info,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    textColor: "text-cyan-700 dark:text-cyan-300",
  },
};

export function NotificationBanner({
  message,
  variant = "error",
  onDismiss,
  className,
}: NotificationBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "glass-card rounded-xl border-l-4 p-4 flex items-start gap-3 animate-fade-in-down",
        config.borderColor,
        config.bg,
        className
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconColor)} />
      <p className={cn("text-sm flex-1", config.textColor)}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            "flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
            config.textColor
          )}
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
