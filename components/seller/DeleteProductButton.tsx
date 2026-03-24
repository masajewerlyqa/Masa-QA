"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { softDeleteProduct } from "@/app/seller/products/actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product? This can be undone by contacting support.")) return;
    setPending(true);
    const result = await softDeleteProduct(productId);
    setPending(false);
    if (result.ok) {
      router.refresh();
    } else {
      alert(result.error ?? "Failed to delete");
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={pending}
      aria-label="Delete product"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
