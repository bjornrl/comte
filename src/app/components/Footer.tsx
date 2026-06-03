import Link from "next/link";
import Image from "next/image";
import { FALLBACK_SITE_SETTINGS } from "@/lib/fallbacks";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getUi } from "@/lib/uiStrings";

// `navKey` indexes the localized label table; `href` stays stable.
const NAV_LINKS = [
  { navKey: "about-intro", href: "/about" },
  { navKey: "projects", href: "/projects" },
  { navKey: "team", href: "/team" },
  { navKey: "publications", href: "/publications" },
  { navKey: "ventures", href: "/ventures" },
] as const;

type FooterProps = {
  email?: string;
  location?: string;
  copyright?: string;
  locale?: Locale;
};

export default function Footer({
  email = FALLBACK_SITE_SETTINGS.email,
  location = FALLBACK_SITE_SETTINGS.location,
  copyright = FALLBACK_SITE_SETTINGS.copyright,
  locale = DEFAULT_LOCALE,
}: FooterProps = {}) {
  const ui = getUi(locale);
  return (
    <footer className="mt-18 border-t border-black/10">
      <div className="relative w-full overflow-hidden bg-[var(--comte-light-base)] font-[var(--font-neue-haas)] text-[var(--comte-dark-green)]">
        {/* Dotted background grid (behind all footer content) */}
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-0 z-0",
            "opacity-100",
            "bg-[radial-gradient(circle,rgba(79,124,108,0.28)_1px,transparent_1.5px),radial-gradient(circle,rgba(79,124,108,0.14)_1px,transparent_1.5px),radial-gradient(circle,rgba(95,124,138,0.22)_1px,transparent_1.5px),radial-gradient(circle,rgba(255,82,82,0.16)_1px,transparent_1.5px)]",
            "bg-[length:16px_16px,16px_16px,32px_32px,32px_32px]",
            "bg-[position:0_0,8px_8px,0_0,16px_16px]",
            "saturate-[0.9] brightness-[1.05]",
          ].join(" ")}
        />

        <div className="relative z-10">
          <div className="mx-auto max-w-[1280px] px-[clamp(1.5rem,4vw,3rem)] pt-16 pb-12">
            <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
              {/* Big Comte logo */}
              <Image
                src="/comtelogo.svg"
                alt="Comte"
                width={306}
                height={75}
                className="h-auto w-[clamp(280px,48vw,520px)] opacity-90 [filter:invert(1)_brightness(0.1)_sepia(0.1)]"
                priority={false}
              />

              {/* Navigation + Contact (right side on desktop) */}
              <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-16">
                <nav aria-label={ui.footer.navigation} className="flex flex-col gap-3">
                  <p className="mb-1 text-[clamp(0.7rem,1vw,0.8rem)] font-normal uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--comte-dark-green)_45%,transparent)]">
                    {ui.footer.navigation}
                  </p>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-[clamp(0.875rem,1.2vw,1rem)] font-light text-[color-mix(in_srgb,var(--comte-dark-green)_72%,transparent)] no-underline"
                    >
                      {ui.nav[link.navKey]}
                    </Link>
                  ))}
                </nav>

                <div className="flex flex-col gap-3">
                  <p className="mb-1 text-[clamp(0.7rem,1vw,0.8rem)] font-normal uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--comte-dark-green)_45%,transparent)]">
                    {ui.footer.contact}
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="text-[clamp(0.875rem,1.2vw,1rem)] font-light text-[color-mix(in_srgb,var(--comte-dark-green)_72%,transparent)] no-underline"
                  >
                    {email}
                  </a>
                  <p className="text-[clamp(0.875rem,1.2vw,1rem)] font-light text-[color-mix(in_srgb,var(--comte-dark-green)_50%,transparent)]">
                    {location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-black/10 px-[clamp(1.5rem,4vw,3rem)] py-6">
            <p className="text-[clamp(0.75rem,1vw,0.8rem)] font-light text-[color-mix(in_srgb,var(--comte-dark-green)_45%,transparent)]">
              &copy; {new Date().getFullYear()} {copyright}
            </p>
            <p className="text-[clamp(0.75rem,1vw,0.8rem)] font-light text-[color-mix(in_srgb,var(--comte-dark-green)_45%,transparent)]">
              Org. nr. 917 584 678
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
