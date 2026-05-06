import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "./components/NavBar";

export const metadata: Metadata = {
  title: "Asset Universe — Master investing, risk-free",
  description: "Calculate your budget, learn every asset class, practice with live market prices, and watch autonomous AI investors evolve.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main style={{ paddingTop: "var(--nav-h)" }}>{children}</main>
      </body>
    </html>
  );
}
