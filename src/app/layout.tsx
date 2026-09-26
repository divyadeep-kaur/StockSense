import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-heading", weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "StockSense",
  description: "Track, manage, and move your inventory in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${caveat.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
