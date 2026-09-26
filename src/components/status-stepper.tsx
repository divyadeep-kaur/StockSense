const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

export function StatusStepper({ steps, current }: { steps: string[]; current: string }) {
  const isCanceled = current === "CANCELED";
  const currentIndex = steps.indexOf(current);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const reached = !isCanceled && currentIndex >= i;
        const active = !isCanceled && currentIndex === i;
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={cx(
                "rounded-full px-3 py-1 text-xs font-medium capitalize",
                active
                  ? "bg-accent text-white"
                  : reached
                  ? "bg-accent-soft text-accent"
                  : "bg-background text-muted border border-border"
              )}
            >
              {step.charAt(0) + step.slice(1).toLowerCase()}
            </span>
            {i < steps.length - 1 && <span className="h-px w-4 bg-border" />}
          </div>
        );
      })}
      {isCanceled && (
        <span className="ml-2 rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-danger">Canceled</span>
      )}
    </div>
  );
}
