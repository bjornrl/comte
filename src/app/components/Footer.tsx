import Link from "next/link";

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="mt-18"
      style={{
        width: "100%",
        backgroundColor: "#1a1a1a",
        color: "#fafafa",
        fontFamily: "var(--font-neue-haas)",
      }}
    >
      {/* Main footer content */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "48px",
          padding: "64px clamp(1.5rem, 4vw, 3rem) 48px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {/* Brand column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link
            href="/"
            style={{
              fontSize: "1.25rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              color: "#fafafa",
              textDecoration: "none",
            }}
          >
            comte
          </Link>
          <p
            style={{
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.5,
              maxWidth: "320px",
            }}
          >
            Innovation for societal impact.
          </p>
        </div>

        {/* Navigation column */}
        <nav
          aria-label="Footer navigation"
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <p
            style={{
              fontSize: "clamp(0.7rem, 1vw, 0.8rem)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "4px",
            }}
          >
            Navigation
          </p>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                fontWeight: 300,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Contact column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p
            style={{
              fontSize: "clamp(0.7rem, 1vw, 0.8rem)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "4px",
            }}
          >
            Contact
          </p>
          <a
            href="mailto:hello@comtebureau.com"
            style={{
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
            }}
          >
            hello@comtebureau.com
          </a>
          <a
            href="tel:+4712345678"
            style={{
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
            }}
          >
            +47 123 45 678
          </a>
          <p
            style={{
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Oslo, Norway
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "24px clamp(1.5rem, 4vw, 3rem)",
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <p
          style={{
            fontSize: "clamp(0.75rem, 1vw, 0.8rem)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          &copy; {new Date().getFullYear()} Comte Bureau. All rights reserved.
        </p>
        <p
          style={{
            fontSize: "clamp(0.75rem, 1vw, 0.8rem)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Org. nr. 917 584 678
        </p>
      </div>
    </footer>
  );
}
