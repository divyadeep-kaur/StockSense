import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";

const FEATURES = [
  {
    title: "Real-time tracking",
    description: "Know what you have, where it is, right now.",
  },
  {
    title: "Multi-warehouse",
    description: "Manage locations and racks across every site.",
  },
  {
    title: "Smart alerts",
    description: "Get notified before stock runs out.",
  },
  {
    title: "Easy operations",
    description: "Receipts, deliveries, transfers in a few clicks.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted sm:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#about" className="hover:text-foreground">
            About
          </a>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
        </nav>
        <Link href="/signup">
          <Button size="sm">Get Started</Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-8 px-6 py-16">
        <div className="max-w-xl">
          <h1 className="text-5xl font-semibold tracking-tight text-foreground">
            Your Inventory,
            <br />
            In Control.
          </h1>
          <p className="mt-5 text-lg text-muted">
            Track. Manage. Move. All in one place. Replace registers, spreadsheets, and
            scattered tracking with a single real-time inventory system.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/signup">
              <Button>Get Started Free</Button>
            </Link>
            <a href="#features" className="text-sm font-medium text-foreground hover:text-accent">
              Learn more
            </a>
          </div>
        </div>

        <div id="features" className="grid w-full grid-cols-1 gap-4 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm font-semibold text-foreground">{feature.title}</p>
              <p className="mt-1 text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
