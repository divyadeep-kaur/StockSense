import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const heading = Sora({ subsets: ["latin"], variable: "--font-heading", weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "StockSense",
  description: "Track, manage, and move your inventory in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${sans.variable} ${heading.variable}`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
