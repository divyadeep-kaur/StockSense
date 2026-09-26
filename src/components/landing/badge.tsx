import { SparkleIcon } from "@/components/icons";

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-soft bg-accent-soft/70 px-3.5 py-1.5 text-xs font-medium text-accent">
      <SparkleIcon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
