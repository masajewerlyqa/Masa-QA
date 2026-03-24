import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

type VerifiedBadgeVariant = "default" | "compact" | "inline" | "gold";
type VerifiedBadgeSize = "sm" | "md" | "lg";

interface VerifiedBadgeProps {
  variant?: VerifiedBadgeVariant;
  size?: VerifiedBadgeSize;
  className?: string;
  showText?: boolean;
}

const sizeConfig = {
  sm: {
    icon: "w-3 h-3",
    text: "text-[10px]",
    padding: "px-1.5 py-0.5",
    gap: "gap-1",
  },
  md: {
    icon: "w-3.5 h-3.5",
    text: "text-xs",
    padding: "px-2 py-1",
    gap: "gap-1.5",
  },
  lg: {
    icon: "w-4 h-4",
    text: "text-sm",
    padding: "px-3 py-1.5",
    gap: "gap-2",
  },
};

/**
 * VerifiedBadge - Shows "Verified by MASA" badge for approved stores/brands.
 *
 * Variants:
 * - default: Full badge with background (for store pages, prominent placement)
 * - compact: Smaller pill badge (for product cards)
 * - inline: Icon + text inline (for use near brand names)
 * - gold: Premium gold style badge (for featured placement)
 *
 * Badge visibility is determined by store.status === "approved" in the database.
 * Only approved stores receive this badge.
 */
export function VerifiedBadge({
  variant = "default",
  size = "md",
  className,
  showText = true,
}: VerifiedBadgeProps) {
  const { isArabic } = useLanguage();
  const config = sizeConfig[size];

  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center text-primary",
          config.gap,
          className
        )}
        title={isArabic ? "موثّق من MASA" : "Verified by MASA"}
      >
        <BadgeCheck className={cn(config.icon, "fill-primary text-white")} />
        {showText && (
          <span className={cn(config.text, "font-medium")}>{isArabic ? "موثّق" : "Verified"}</span>
        )}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-primary/10 text-primary",
          config.gap,
          config.padding,
          className
        )}
        title={isArabic ? "موثّق من MASA" : "Verified by MASA"}
      >
        <BadgeCheck className={cn(config.icon, "fill-primary text-white")} />
        {showText && (
          <span className={cn(config.text, "font-medium")}>{isArabic ? "موثّق" : "Verified"}</span>
        )}
      </span>
    );
  }

  if (variant === "gold") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-masa-gold text-white",
          config.gap,
          config.padding,
          className
        )}
        title={isArabic ? "موثّق من MASA" : "Verified by MASA"}
      >
        <BadgeCheck className={cn(config.icon, "fill-white text-masa-gold")} />
        {showText && (
          <span className={cn(config.text, "font-medium")}>
            {isArabic ? "علامة موثّقة" : "Verified Brand"}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary text-white",
        config.gap,
        config.padding,
        className
      )}
      title={isArabic ? "موثّق من MASA" : "Verified by MASA"}
    >
      <BadgeCheck className={cn(config.icon, "fill-white text-primary")} />
      {showText && (
        <span className={cn(config.text, "font-medium")}>{isArabic ? "موثّق من MASA" : "Verified by MASA"}</span>
      )}
    </span>
  );
}
