import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "./components/NavBar";
import { ParticleCanvas } from "./components/ParticleCanvas";

export const metadata: Metadata = {
  title: "Asset Universe — Master Investing Risk-Free",
  description: "Practice investing with real market data and zero risk. Budget, learn, simulate, and watch AI investors in action.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ParticleCanvas />
        <NavBar />
        <main style={{ position: "relative", zIndex: 1, paddingTop: "var(--nav-h)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
