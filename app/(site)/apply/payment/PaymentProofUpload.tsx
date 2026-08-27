"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadPaymentProofAction } from "./actions";

const ACCEPT = "image/jpeg,image/png,application/pdf";
const MAX_BYTES = 5 * 1024 * 1024;

export function PaymentProofUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const chosen = e.target.files?.[0] ?? null;
    if (!chosen) {
      setFile(null);
      return;
    }
    // Checked again on the server; this is only to fail fast for the user.
    if (chosen.size > MAX_BYTES) {
      setFile(null);
      setError("That file is larger than 5 MB. Please choose a smaller file.");
      return;
    }
    if (!ACCEPT.split(",").includes(chosen.type)) {
      setFile(null);
      setError("Please choose a JPG, PNG, or PDF file.");
      return;
    }
    setFile(chosen);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.set("proof", file);

    startTransition(async () => {
      const result = await uploadPaymentProofAction(formData);
      if (result.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-4 font-sans"
      >
        <Check className="w-5 h-5 text-green-700 shrink-0 mt-0.5" aria-hidden />
        <div className="space-y-1">
          <p className="text-sm font-medium text-green-900">Payment proof submitted</p>
          <p className="text-sm text-green-800">
            Status: Under review. Applications are normally reviewed within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      <div className="space-y-2">
        <label htmlFor="payment-proof" className="block text-sm font-medium text-masa-dark">
          Proof of payment
        </label>
        <input
          id="payment-proof"
          name="proof"
          type="file"
          accept={ACCEPT}
          onChange={handleSelect}
          aria-describedby={error ? "payment-proof-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="block w-full text-sm text-masa-dark file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-primary/90"
        />
      </div>

      {error && (
        <p id="payment-proof-error" role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending || !file} className="bg-primary hover:bg-primary/90">
        <Upload className="w-4 h-4 mr-2" aria-hidden />
        {pending ? "Uploading…" : "Submit payment proof"}
      </Button>
    </form>
  );
}
