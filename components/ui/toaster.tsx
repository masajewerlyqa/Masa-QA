"use client";

import { useToast } from "@/hooks/use-toast";
import { ToastContainer, ToastItem } from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={dismiss} />
      ))}
    </ToastContainer>
  );
}
