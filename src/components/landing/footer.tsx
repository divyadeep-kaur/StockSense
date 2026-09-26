import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: "#dashboard-preview" },
      { label: "Operations", href: "#how-it-works" },
      { label: "Warehouses", href: "#features" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const TEAM = [
  { name: "Divyadeep", email: "Officialdivyadeep@gmail.com" },
  { name: "Jashanpreet Singh", email: "jashanpreetsing78147@gmail.com" },
];

export function Footer() {
  return (
    <footer id="about" className="border-t border-border bg-surface py-14">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted">Your inventory, in control.</p>
        </div>

        {COLUMNS.slice(0, 1).map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-foreground">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-sm font-semibold text-foreground">About</p>
          <ul className="mt-3 space-y-2">
            <li>
              <a href="#about" className="text-sm text-muted hover:text-foreground">
                About
              </a>
            </li>
            <li className="text-sm font-medium text-foreground">Contact</li>
            {TEAM.map((member) => (
              <li key={member.email}>
                <a href={`mailto:${member.email}`} className="text-sm text-muted hover:text-foreground">
                  {member.name} — {member.email}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {COLUMNS.slice(1).map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-foreground">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 w-full max-w-6xl border-t border-border px-6 pt-6 text-sm text-muted">
        © {new Date().getFullYear()} StockSense. All rights reserved.
      </div>
    </footer>
  );
}
