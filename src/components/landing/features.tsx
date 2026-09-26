import { SectionBadge } from "@/components/landing/badge";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";
import {
  BoxIcon,
  HistoryIcon,
  InboxIcon,
  SlidersIcon,
  TransferIcon,
  WarehouseIcon,
} from "@/components/icons";

const FEATURES = [
  { icon: BoxIcon, title: "Product Management", description: "Add, edit and organize your products with ease." },
  { icon: TransferIcon, title: "Internal Transfers", description: "Move stock between warehouses and locations without the hassle." },
  { icon: WarehouseIcon, title: "Multi-Warehouse Support", description: "Manage multiple locations from a single dashboard." },
  { icon: InboxIcon, title: "Receipts & Deliveries", description: "Track incoming and outgoing stock in real time." },
  { icon: SlidersIcon, title: "Stock Adjustments", description: "Keep your inventory accurate when physical counts differ." },
  { icon: HistoryIcon, title: "Complete History", description: "View every inventory movement with detailed logs." },
];

export function Features() {
  return (
    <section id="features" className="bg-surface py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <ScrollReveal className="max-w-2xl">
          <SectionBadge>Why Choose StockSense</SectionBadge>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            Everything You Need, In One Place
          </h2>
          <p className="mt-3 text-muted">
            From tracking stock to managing warehouses, StockSense gives you complete control over your inventory
            with simplicity and speed.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 60}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <f.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold text-foreground">{f.title}</p>
                <p className="mt-1 text-sm text-muted">{f.description}</p>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <div className="rotate-2 transition-transform duration-500 hover:rotate-0">
              <DashboardMockup compact />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
