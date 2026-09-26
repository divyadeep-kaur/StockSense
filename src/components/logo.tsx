export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M3 7 L12 12 L21 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 12 L12 22" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="text-lg font-semibold text-foreground">StockSense</span>
    </div>
  );
}
