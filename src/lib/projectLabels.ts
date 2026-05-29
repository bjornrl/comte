import type { Domain, Method } from "@/app/components/projectNetworkData";
import { type Locale, DEFAULT_LOCALE } from "@/lib/locale";

export type TaxonomyLabelEntry = {
  value: string;
  label?: { en?: string; no?: string } | null;
};

export type ProjectTaxonomyDoc = {
  categories?: TaxonomyLabelEntry[] | null;
  methods?: TaxonomyLabelEntry[] | null;
};

/** English defaults — keep in sync with Sanity PROJECT_TAGS / PROJECT_METHODS. */
export const DEFAULT_CATEGORY_LABELS_EN: Record<Domain, string> = {
  health: "Health & Care",
  education: "Childhood & Education",
  integration: "Inclusion & Participation",
  urban: "Spaces & Places",
  climate: "Climate & Sustainability",
  digital: "Digital Transformation",
  culture: "Culture",
  policy: "Policy",
};

export const DEFAULT_CATEGORY_LABELS_NO: Record<Domain, string> = {
  health: "Helse og omsorg",
  education: "Barndom og utdanning",
  integration: "Inkludering og deltakelse",
  urban: "Rom og steder",
  climate: "Klima og bærekraft",
  digital: "Digital transformasjon",
  culture: "Kultur",
  policy: "Politikk",
};

export const DEFAULT_METHOD_LABELS_EN: Record<Method, string> = {
  research: "Research",
  codesign: "Co-design",
  implementation: "Implementation",
  strategy: "Strategy",
  foresight: "Foresight",
};

export const DEFAULT_METHOD_LABELS_NO: Record<Method, string> = {
  research: "Forskning",
  codesign: "Samdesign",
  implementation: "Implementering",
  strategy: "Strategi",
  foresight: "Fremtidsarbeid",
};

let categoryLabelsEn: Record<string, string> = { ...DEFAULT_CATEGORY_LABELS_EN };
let categoryLabelsNo: Record<string, string> = { ...DEFAULT_CATEGORY_LABELS_NO };
let methodLabelsEn: Record<string, string> = { ...DEFAULT_METHOD_LABELS_EN };
let methodLabelsNo: Record<string, string> = { ...DEFAULT_METHOD_LABELS_NO };

function mergeTaxonomyEntries(
  targetEn: Record<string, string>,
  targetNo: Record<string, string>,
  entries: TaxonomyLabelEntry[] | null | undefined,
  defaultsEn: Record<string, string>,
  defaultsNo: Record<string, string>,
) {
  const en = { ...defaultsEn };
  const no = { ...defaultsNo };
  for (const entry of entries ?? []) {
    const value = entry?.value;
    if (!value) continue;
    if (entry.label?.en) en[value] = entry.label.en;
    if (entry.label?.no) no[value] = entry.label.no;
  }
  return { en, no };
}

/** Apply CMS taxonomy (e.g. after fetch on the server or in the client). */
export function applyProjectTaxonomy(taxonomy: ProjectTaxonomyDoc | null | undefined) {
  const cats = mergeTaxonomyEntries(
    categoryLabelsEn,
    categoryLabelsNo,
    taxonomy?.categories,
    DEFAULT_CATEGORY_LABELS_EN,
    DEFAULT_CATEGORY_LABELS_NO,
  );
  categoryLabelsEn = cats.en;
  categoryLabelsNo = cats.no;

  const methods = mergeTaxonomyEntries(
    methodLabelsEn,
    methodLabelsNo,
    taxonomy?.methods,
    DEFAULT_METHOD_LABELS_EN,
    DEFAULT_METHOD_LABELS_NO,
  );
  methodLabelsEn = methods.en;
  methodLabelsNo = methods.no;
}

export function getCategoryLabel(value: string, locale: Locale = DEFAULT_LOCALE): string {
  const map = locale === "no" ? categoryLabelsNo : categoryLabelsEn;
  return map[value] ?? (locale === "no" ? DEFAULT_CATEGORY_LABELS_NO : DEFAULT_CATEGORY_LABELS_EN)[value as Domain] ?? value;
}

export function getMethodLabel(value: string, locale: Locale = DEFAULT_LOCALE): string {
  const map = locale === "no" ? methodLabelsNo : methodLabelsEn;
  return map[value] ?? (locale === "no" ? DEFAULT_METHOD_LABELS_NO : DEFAULT_METHOD_LABELS_EN)[value as Method] ?? value;
}

/** Snapshot for filter UI — all domain keys with localized labels. */
export function getCategoryLabelMap(locale: Locale): Record<Domain, string> {
  const domains = Object.keys(DEFAULT_CATEGORY_LABELS_EN) as Domain[];
  return Object.fromEntries(domains.map((d) => [d, getCategoryLabel(d, locale)])) as Record<Domain, string>;
}

export function getMethodLabelMap(locale: Locale): Record<Method, string> {
  const methods = Object.keys(DEFAULT_METHOD_LABELS_EN) as Method[];
  return Object.fromEntries(methods.map((m) => [m, getMethodLabel(m, locale)])) as Record<Method, string>;
}
