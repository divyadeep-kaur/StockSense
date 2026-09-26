import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SectionBadge } from "@/components/landing/badge";
import { ArrowUpRightIcon } from "@/components/icons";

const NODES = [
  { label: "Supplier", detail: "ABC Traders" },
  { label: "Main Warehouse", detail: "+100 Steel Rods" },
  { label: "Production Rack", detail: "Transfer · 100 units" },
  { label: "Customer", detail: "Delivery -20 · Adjustment -3" },
];

export function InventoryFlow() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <SectionBadge>Not Just Numbers</SectionBadge>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            StockSense Tracks Movement, Not Just Counts
          </h2>
          <p className="mt-3 text-muted">
            Every unit is followed from the moment it arrives to the moment it leaves — with a full trail in between.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-14 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
            {NODES.map((node, i) => (
              <div key={node.label} className="flex flex-col gap-3 lg:contents">
                <div className="flex-1 rounded-2xl border border-border bg-background p-5">
                  <p className="font-semibold text-foreground">{node.label}</p>
                  <p className="mt-1.5 text-sm text-accent">{node.detail}</p>
                </div>
                {i < NODES.length - 1 && (
                  <ArrowUpRightIcon className="h-5 w-5 shrink-0 rotate-[135deg] text-muted lg:mx-0 lg:rotate-45" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-accent-soft bg-accent-soft/50 p-5 text-center">
            <p className="text-sm text-muted">
              +100 Steel Rods → Transfer → 100 at Production Rack → Delivery −20 → Adjustment −3 →{" "}
              <span className="font-semibold text-accent">77 remaining</span>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
