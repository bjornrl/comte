export type OutputType = "presentation" | "report";

export type Slide =
  | { kind: "cover"; title: string; subtitle?: string }
  | { kind: "category"; categoryId: string }
  | { kind: "expertise"; categoryId: string }
  | { kind: "stats"; categoryId: string }
  | { kind: "project"; projectId: string }
  | { kind: "outro"; title?: string };

export default function buildSlides(
  categoryId: string | null,
  projectIds: string[],
  output: OutputType
): Slide[] {
  const slides: Slide[] = [];
  slides.push({
    kind: "cover",
    title: "Comte Bureau",
    subtitle: "Innovations that change how we live",
  });
  if (categoryId) {
    slides.push({ kind: "category", categoryId });
    slides.push({ kind: "expertise", categoryId });
    slides.push({ kind: "stats", categoryId });
  }
  for (const pid of projectIds)
    slides.push({ kind: "project", projectId: pid });
  slides.push({
    kind: "outro",
    title: output === "report" ? "Takk" : "Comte Bureau",
  });
  return slides;
}
