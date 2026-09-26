import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SectionBadge } from "@/components/landing/badge";

const STEPS = [
  { n: "01", title: "Add Products", description: "Create products with SKU, category, unit and stock information." },
  { n: "02", title: "Receive & Store", description: "Record incoming goods and assign them to warehouse locations." },
  { n: "03", title: "Move & Deliver", description: "Transfer stock internally or send it to customers." },
  { n: "04", title: "Track Everything", description: "Every movement is automatically recorded in the stock ledger." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <SectionBadge>The Process</SectionBadge>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">How It Works</h2>
          <p className="mt-3 text-muted">Four simple steps take you from a raw product to a fully tracked inventory system.</p>
        </ScrollReveal>

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-6 hidden h-px w-full bg-border lg:block" />
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.n} delay={i * 100} className="relative">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-accent-soft bg-surface font-heading text-xl text-accent shadow-sm">
                {step.n}
              </div>
              <p className="mt-4 font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
