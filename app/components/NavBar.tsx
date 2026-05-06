"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Budget" },
  { href: "/learn", label: "Learn" },
  { href: "/simulate", label: "Simulate" },
  { href: "/my-portfolio", label: "My Portfolio" },
  { href: "/ai-investors", label: "AI Investors" },
  { href: "/profile", label: "Profile" },
];

export function NavBar() {
  const path = usePathname();
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: "var(--nav-h)",
      background: "rgba(5,8,16,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "linear-gradient(135deg, #a78bfa, #38bdf8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 900, color: "#000",
          fontFamily: "Syne, sans-serif",
          flexShrink: 0,
        }}>AU</div>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: "var(--text)" }}>
          Asset Universe
        </span>
      </Link>

      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {LINKS.map(l => {
          const active = path === l.href || path?.startsWith(l.href + "/");
          const isAI = l.href === "/ai-investors";
          return (
            <Link key={l.href} href={l.href} style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: active ? 700 : 400,
              color: active ? (isAI ? "#a78bfa" : "var(--text)") : "var(--text2)",
              background: active ? (isAI ? "var(--purple-dim)" : "var(--surface2)") : "transparent",
              border: active ? `1px solid ${isAI ? "var(--purple-border)" : "var(--border)"}` : "1px solid transparent",
              transition: "all 0.2s",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
