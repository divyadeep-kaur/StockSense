import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm" };
  const variants = {
    primary: "bg-accent text-accent-foreground hover:bg-accent/90",
    secondary: "bg-surface border border-border text-foreground hover:bg-background",
    ghost: "text-foreground hover:bg-background",
    danger: "bg-danger text-white hover:bg-danger/90",
  };
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...props} />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cx("mb-1.5 block text-sm font-medium text-foreground", className)} {...props} />;
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-danger">{children}</p>;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-2xl border border-border bg-surface shadow-sm", className)}>
      {children}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-background text-muted border border-border",
  WAITING: "bg-warning-soft text-warning",
  READY: "bg-info-soft text-info",
  DONE: "bg-success-soft text-success",
  CANCELED: "bg-danger-soft text-danger",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize", style)}>
      {label}
    </span>
  );
}

const STOCK_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  IN_STOCK: { label: "In Stock", className: "bg-success-soft text-success" },
  LOW_STOCK: { label: "Low Stock", className: "bg-warning-soft text-warning" },
  OUT_OF_STOCK: { label: "Out of Stock", className: "bg-danger-soft text-danger" },
};

export function StockStatusBadge({ status }: { status: string }) {
  const style = STOCK_STATUS_STYLES[status] ?? STOCK_STATUS_STYLES.IN_STOCK;
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", style.className)}>
      {style.label}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
