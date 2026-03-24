"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastProps, ToastVariant } from "@/hooks/use-toast";

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-white border-primary/20 text-masa-dark",
  destructive: "bg-red-50 border-red-200 text-red-900",
  success: "bg-green-50 border-green-200 text-green-900",
};

interface ToastItemProps extends ToastProps {
  onDismiss: (id: string) => void;
}

export function ToastItem({ id, title, description, variant = "default", onDismiss }: ToastItemProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all",
        "animate-in slide-in-from-right-full fade-in duration-300",
        variantStyles[variant]
      )}
      role="alert"
    >
      <div className="flex-1 space-y-1">
        {title && <p className="text-sm font-medium">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 pointer-events-none">
      {children}
    </div>
  );
}
