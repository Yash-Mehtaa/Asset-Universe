"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { num: "01", href: "/", label: "Home" },
  { num: "02", href: "/dashboard", label: "Budget" },
  { num: "03", href: "/learn", label: "Learn" },
  { num: "04", href: "/simulate", label: "Simulate" },
  { num: "05", href: "/my-portfolio", label: "Portfolio" },
  { num: "06", href: "/ai-investors", label: "AI Investors" },
];

export function NavBar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: "var(--nav-h)",
      background: "rgba(14,13,10,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36,
          background: "var(--accent)",
          borderRadius: "var(--radius)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--bg)",
          fontFamily: "var(--serif)",
          fontWeight: 700,
          fontSize: 15,
        }}>AU</div>
        <span style={{
          fontFamily: "var(--serif)",
          fontWeight: 600, fontSize: 19,
          letterSpacing: "-0.01em",
        }}>Asset Universe</span>
      </Link>

      <div className="desktop-nav" style={{
        display: "flex", alignItems: "center", gap: 4,
      }}>
        {LINKS.map(l => {
          const active = path === l.href;
          return (
            <Link key={l.href} href={l.href} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px",
              borderRadius: "var(--radius)",
              fontSize: 14,
              fontWeight: active ? 500 : 400,
              color: active ? "var(--accent)" : "var(--text-2)",
              background: active ? "var(--accent-soft)" : "transparent",
              transition: "all 0.2s",
            }}>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 11,
                color: active ? "var(--accent)" : "var(--text-3)",
              }}>{l.num}</span>
              {l.label}
            </Link>
          );
        })}
      </div>

      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(!open)}
        style={{
          display: "none",
          padding: 8,
          color: "var(--text)",
          fontSize: 20,
        }}
        aria-label="Menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "var(--nav-h)", left: 0, right: 0,
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {LINKS.map(l => {
            const active = path === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderRadius: "var(--radius)",
                color: active ? "var(--accent)" : "var(--text-2)",
                background: active ? "var(--accent-soft)" : "transparent",
                fontSize: 16,
              }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>{l.num}</span>
                {l.label}
              </Link>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
