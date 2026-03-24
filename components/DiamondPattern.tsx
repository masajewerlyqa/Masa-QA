export function DiamondPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none opacity-5 ${className}`} aria-hidden>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="diamond-pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0 L60 20 L40 40 L20 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diamond-pattern)" />
      </svg>
    </div>
  );
}
