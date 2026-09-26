import Link from "next/link";
import { Button } from "@/components/ui";
import { SectionBadge } from "@/components/landing/badge";
import { HeroVisual } from "@/components/landing/hero-visual";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { BellIcon, HistoryIcon, InboxIcon, PlayIcon, WarehouseIcon } from "@/components/icons";

const HERO_FEATURES = [
  { icon: HistoryIcon, title: "Real-time Tracking", description: "Know what you have" },
  { icon: WarehouseIcon, title: "Multi-Warehouse", description: "Manage multiple locations" },
  { icon: BellIcon, title: "Smart Alerts", description: "Never run out of stock" },
  { icon: InboxIcon, title: "Easy Operations", description: "Receipts, deliveries & more" },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pb-24 pt-36">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <SectionBadge>Smarter Inventory. Smoother Operations.</SectionBadge>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Your Inventory,
            <br />
            <span className="bg-gradient-to-r from-accent to-indigo-400 bg-clip-text text-transparent">In Control.</span>
          </h1>

          <p className="mt-5 text-lg font-medium text-foreground">Track. Manage. Move. All in one place.</p>
          <p className="mt-3 max-w-lg text-muted">
            From stock tracking to warehouse operations, StockSense gives your business a centralized, real-time view
            of everything moving through your inventory.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/signup">
              <Button className="group">
                Get Started Free
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Button>
            </Link>
            <a
              href="#dashboard-preview"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <PlayIcon className="h-4 w-4" />
              Watch Demo
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {HERO_FEATURES.map((f) => (
              <div key={f.title}>
                <f.icon className="h-5 w-5 text-accent" />
                <p className="mt-2 text-sm font-semibold text-foreground">{f.title}</p>
                <p className="text-xs text-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        <ScrollReveal>
          <HeroVisual />
        </ScrollReveal>
      </div>
    </section>
  );
}
