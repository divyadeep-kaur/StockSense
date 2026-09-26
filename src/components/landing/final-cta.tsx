import Link from "next/link";
import { Button } from "@/components/ui";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function FinalCta() {
  return (
    <section className="bg-gradient-to-b from-accent-soft/60 to-transparent py-24">
      <ScrollReveal className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">Take control of your inventory.</h2>
        <p className="mt-3 text-muted">Know what you have. Know where it is. Know what happens next.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="md">Get Started Free →</Button>
          </Link>
          <a href="#features" className="text-sm font-medium text-foreground hover:text-accent">
            Explore Features
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
