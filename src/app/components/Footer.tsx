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
        backgroundColor: "var(--comte-near-black)",
        color: "var(--comte-light-base)",
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
              color: "var(--comte-light-base)",
              textDecoration: "none",
            }}
          >
            comte
          </Link>
          <p
            style={{
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              fontWeight: 300,
              color: "color-mix(in srgb, var(--comte-light-base) 50%, transparent)",
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
              color: "color-mix(in srgb, var(--comte-light-base) 35%, transparent)",
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
                color: "color-mix(in srgb, var(--comte-light-base) 70%, transparent)",
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
              color: "color-mix(in srgb, var(--comte-light-base) 35%, transparent)",
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
              color: "color-mix(in srgb, var(--comte-light-base) 70%, transparent)",
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
              color: "color-mix(in srgb, var(--comte-light-base) 70%, transparent)",
              textDecoration: "none",
            }}
          >
            +47 123 45 678
          </a>
          <p
            style={{
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              fontWeight: 300,
              color: "color-mix(in srgb, var(--comte-light-base) 50%, transparent)",
            }}
          >
            Oslo, Norway
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop:
            "1px solid color-mix(in srgb, var(--comte-light-base) 10%, transparent)",
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
            color: "color-mix(in srgb, var(--comte-light-base) 35%, transparent)",
          }}
        >
          &copy; {new Date().getFullYear()} Comte Bureau. All rights reserved.
        </p>
        <p
          style={{
            fontSize: "clamp(0.75rem, 1vw, 0.8rem)",
            fontWeight: 300,
            color: "color-mix(in srgb, var(--comte-light-base) 35%, transparent)",
          }}
        >
          Org. nr. 917 584 678
        </p>
      </div>
    </footer>
  );
}
