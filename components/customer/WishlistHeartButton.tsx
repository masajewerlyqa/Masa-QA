"use client";

import type { MouseEvent } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/app/(site)/wishlist/actions";

export function WishlistHeartButton({
  productId,
  isInWishlist,
  className,
  size = "icon",
  variant = "outline",
  ariaLabel,
}: {
  productId: string;
  isInWishlist: boolean;
  className?: string;
  size?: "icon" | "sm" | "default" | "lg";
  variant?: "outline" | "ghost";
  ariaLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleWishlist(productId, isInWishlist);
      if (result.ok) router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isPending}
      aria-label={ariaLabel ?? (isInWishlist ? "Remove from wishlist" : "Add to wishlist")}
    >
      <Heart
        className={`${size === "icon" ? "w-4 h-4" : "w-5 h-5"} ${isInWishlist ? "fill-primary text-primary" : ""}`}
      />
    </Button>
  );
}
