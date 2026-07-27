"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyAccountId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard permission denied or unavailable
    }
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-masa-dark text-xs sm:text-sm break-all">{id}</p>
      <button
        type="button"
        onClick={() => void handleCopy()}
        aria-label="Copy account ID"
        className="shrink-0 rounded p-1 text-masa-gray hover:text-primary hover:bg-masa-light transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
      </button>
    </div>
  );
}
