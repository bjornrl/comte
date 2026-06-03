import { DEFAULT_LOCALE, type Locale } from "./locale";

/**
 * Static UI-chrome strings (nav, CTAs, aria-labels, section labels) that are
 * NOT authored in Sanity. Sanity-backed content is localized via the GROQ
 * `t()` helper; everything here is the hardcoded interface text around it.
 *
 * ⚠️ TRANSLATIONS: the Norwegian (`no`) values below were drafted for the
 * launch and should be reviewed by a native speaker — every string a visitor
 * sees lives in this one file, so wording tweaks happen here and nowhere else.
 *
 * Client components read these via `useUi()` (see app/components/useUi.ts);
 * server components call `getUi(await getServerLocale())`.
 */
export type UiStrings = {
  /** Keyed by BlobNav sectionId so the identifier stays stable while the label localizes. */
  nav: Record<
    "about-intro" | "projects" | "team" | "publications" | "ventures" | "contact",
    string
  >;
  navAria: {
    openMenu: string;
    closeMenu: string;
    home: string;
    backToOverview: string;
    backToPublications: string;
    /** `(viewing X)` suffix appended to backToPublications when an item is open. */
    currentlyViewing: (title: string) => string;
  };
  footer: { navigation: string; contact: string };
  buy: {
    buyNow: string; // followed by " — {price}"
    redirecting: string;
    couldNotStart: string;
    somethingWrong: string;
  };
  publication: {
    freeBadge: string;
    publicationSuffix: string; // "{price} · {publicationSuffix}"
    downloadLabel: string;
    freeToDownload: string;
    checkoutCanceled: string;
    downloadPdf: string;
    pdfComingSoon: string;
    backToAll: string;
    readMoreAbout: (title: string) => string;
    readMoreAboutThis: string;
    readMoreAndOrder: string;
    browse: string;
    scrollUp: string;
    scrollDown: string;
    view: string;
  };
  success: {
    thanks: string;
    notConfirmed: string;
    ready: string;
    charged: (amount: string) => string;
    confirmed: string;
    emailedReceipt: (email: string) => string;
    clickBelow: string;
    pdfNotUploaded: string;
    couldNotVerify: string;
    ifCharged: string;
    tryAgain: (price: string) => string;
  };
  project: { wantToKnowMore: string; haveQuestions: string; getInTouch: string };
  contact: {
    getInTouch: string;
    getInTouchAria: string;
    whereToFind: string;
    contact: string;
    general: string;
    projects: string;
  };
  sheet: { close: string };
};

const en: UiStrings = {
  nav: {
    "about-intro": "About",
    projects: "Projects",
    team: "Team",
    publications: "Publications",
    ventures: "Ventures",
    contact: "Contact",
  },
  navAria: {
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
    home: "Comte – home",
    backToOverview: "back to overview",
    backToPublications: "Back to publications overview",
    currentlyViewing: (title) => `currently viewing ${title}`,
  },
  footer: { navigation: "Navigation", contact: "Contact" },
  buy: {
    buyNow: "Buy now",
    redirecting: "Redirecting…",
    couldNotStart: "Could not start checkout.",
    somethingWrong: "Something went wrong.",
  },
  publication: {
    freeBadge: "Free publication",
    publicationSuffix: "Publication",
    downloadLabel: "Download",
    freeToDownload: "This publication is free to download.",
    checkoutCanceled: "Checkout was canceled — no payment was taken.",
    downloadPdf: "Download PDF",
    pdfComingSoon: "PDF coming soon",
    backToAll: "← Back to all publications",
    readMoreAbout: (title) => `Read more about ${title}`,
    readMoreAboutThis: "Read more about this publication",
    readMoreAndOrder: "Read more and order",
    browse: "Browse publications",
    scrollUp: "Scroll publications up",
    scrollDown: "Scroll publications down",
    view: "View",
  },
  success: {
    thanks: "Thank you · Payment received",
    notConfirmed: "Payment not confirmed",
    ready: "Your copy is ready.",
    charged: (amount) => `We charged ${amount}`,
    confirmed: "Payment confirmed",
    emailedReceipt: (email) => ` and emailed a receipt to ${email}.`,
    clickBelow:
      "Click below to download the PDF — you can come back to this page any time.",
    pdfNotUploaded:
      "The PDF hasn't been uploaded yet — we'll email it as soon as it's available. If you need it sooner, reply to your Stripe receipt.",
    couldNotVerify: "We couldn't verify the payment.",
    ifCharged: "If you were charged, contact us and we'll sort it out.",
    tryAgain: (price) => `Try again (${price})`,
  },
  project: {
    wantToKnowMore: "Want to know more about the project?",
    haveQuestions: "Do you have any questions regarding this project?",
    getInTouch: "Get in touch",
  },
  contact: {
    getInTouch: "Get in touch",
    getInTouchAria: "Get in touch — go to contact section",
    whereToFind: "Where to find us",
    contact: "Contact",
    general: "General",
    projects: "Projects",
  },
  sheet: { close: "Close" },
};

const no: UiStrings = {
  nav: {
    "about-intro": "Om oss",
    projects: "Prosjekter",
    team: "Team",
    publications: "Publikasjoner",
    ventures: "Ventures",
    contact: "Kontakt",
  },
  navAria: {
    openMenu: "Åpne meny",
    closeMenu: "Lukk meny",
    home: "Comte – hjem",
    backToOverview: "tilbake til oversikt",
    backToPublications: "Tilbake til publikasjonsoversikt",
    currentlyViewing: (title) => `viser nå ${title}`,
  },
  footer: { navigation: "Navigasjon", contact: "Kontakt" },
  buy: {
    buyNow: "Kjøp nå",
    redirecting: "Omdirigerer…",
    couldNotStart: "Kunne ikke starte betalingen.",
    somethingWrong: "Noe gikk galt.",
  },
  publication: {
    freeBadge: "Gratis publikasjon",
    publicationSuffix: "Publikasjon",
    downloadLabel: "Last ned",
    freeToDownload: "Denne publikasjonen er gratis å laste ned.",
    checkoutCanceled: "Betalingen ble avbrutt — ingenting ble belastet.",
    downloadPdf: "Last ned PDF",
    pdfComingSoon: "PDF kommer snart",
    backToAll: "← Tilbake til alle publikasjoner",
    readMoreAbout: (title) => `Les mer om ${title}`,
    readMoreAboutThis: "Les mer om denne publikasjonen",
    readMoreAndOrder: "Les mer og bestill",
    browse: "Bla i publikasjoner",
    scrollUp: "Bla publikasjoner opp",
    scrollDown: "Bla publikasjoner ned",
    view: "Vis",
  },
  success: {
    thanks: "Takk · Betaling mottatt",
    notConfirmed: "Betaling ikke bekreftet",
    ready: "Eksemplaret ditt er klart.",
    charged: (amount) => `Vi belastet ${amount}`,
    confirmed: "Betaling bekreftet",
    emailedReceipt: (email) => ` og sendte en kvittering til ${email}.`,
    clickBelow:
      "Klikk nedenfor for å laste ned PDF-en — du kan komme tilbake til denne siden når som helst.",
    pdfNotUploaded:
      "PDF-en er ikke lastet opp ennå — vi sender den på e-post så snart den er klar. Trenger du den raskere, svar på Stripe-kvitteringen din.",
    couldNotVerify: "Vi kunne ikke bekrefte betalingen.",
    ifCharged: "Hvis du ble belastet, ta kontakt så ordner vi opp.",
    tryAgain: (price) => `Prøv igjen (${price})`,
  },
  project: {
    wantToKnowMore: "Vil du vite mer om prosjektet?",
    haveQuestions: "Har du spørsmål om dette prosjektet?",
    getInTouch: "Ta kontakt",
  },
  contact: {
    getInTouch: "Ta kontakt",
    getInTouchAria: "Ta kontakt — gå til kontaktseksjonen",
    whereToFind: "Hvor du finner oss",
    contact: "Kontakt",
    general: "Generelt",
    projects: "Prosjekter",
  },
  sheet: { close: "Lukk" },
};

const TABLE: Record<Locale, UiStrings> = { en, no };

/** Pure locale → strings lookup. Safe to import in server or client modules. */
export function getUi(locale: Locale): UiStrings {
  return TABLE[locale] ?? TABLE[DEFAULT_LOCALE];
}
