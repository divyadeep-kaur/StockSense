import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SectionBadge } from "@/components/landing/badge";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";

export function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <SectionBadge>Live Overview</SectionBadge>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            See Everything. Control Everything.
          </h2>
          <p className="mt-3 text-muted">
            A single dashboard for stock levels, pending work, and everything moving through your warehouses.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-14 rounded-3xl border border-border bg-accent-soft/30 p-4 shadow-2xl sm:p-8">
            <DashboardMockup />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
