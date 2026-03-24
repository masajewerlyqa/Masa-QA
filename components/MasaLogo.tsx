/**
 * Shared MASA logo (SVG) for Navbar, Footer, and Dashboard.
 * Variant "light" = for dark bg (primary), "dark" = for light bg (white/masa-light).
 */
interface MasaLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showArabic?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const textSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-2xl",
};

export function MasaLogo({
  variant = "dark",
  size = "md",
  showArabic = true,
  className = "",
}: MasaLogoProps) {
  const isLight = variant === "light";
  const fillChampagne = "#E7D8C3";
  const fillGold = "#D4AF37";
  const fillAccent = isLight ? "#531C24" : "#FFFFFF";

  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} flex items-center justify-center ${isLight ? "bg-white" : "bg-primary"}`}
        aria-hidden
      >
        <svg
          width={size === "sm" ? 20 : size === "md" ? 24 : 28}
          height={size === "sm" ? 20 : size === "md" ? 24 : 28}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2 L2 7 L12 12 L22 7 L12 2Z" fill={fillChampagne} />
          <path d="M12 12 L2 7 L2 17 L12 22 L12 12Z" fill={fillGold} />
          <path d="M12 12 L22 7 L22 17 L12 22 L12 12Z" fill={fillAccent} />
        </svg>
      </div>
      <div>
        <span
          className={`${textSizes[size]} tracking-wider font-luxury block ${isLight ? "text-white" : "text-primary"}`}
        >
          MASA
        </span>
        {showArabic && (
          <span
            className={`text-sm tracking-widest font-arabic block ${isLight ? "text-secondary" : "text-masa-gray"}`}
          >
            ماسا
          </span>
        )}
      </div>
    </div>
  );
}
