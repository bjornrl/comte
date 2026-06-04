import type { StructureBuilder } from "sanity/structure";

const singleton = (
  S: StructureBuilder,
  typeName: string,
  title: string,
  documentId: string = typeName,
) =>
  S.listItem()
    .title(title)
    .id(documentId)
    .child(S.document().schemaType(typeName).documentId(documentId).title(title));

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home")
        .child(
          S.list()
            .title("Home")
            .items([
              singleton(S, "homeSection", "Home"),
              singleton(S, "mottoSection", "Motto"),
            ]),
        ),
      S.listItem()
        .title("About")
        .child(
          S.list()
            .title("About")
            .items([
              singleton(S, "aboutIntro", "Intro"),
            ]),
        ),
      singleton(S, "whatWeDo", "What do we do?"),
      S.divider(),
      S.listItem()
        .title("Projects")
        .child(
          S.list()
            .title("Projects")
            .items([
              singleton(S, "projectsSection", "Section Settings"),
              singleton(S, "projectTaxonomy", "Category & method labels"),
              S.divider(),
              S.documentTypeListItem("project").title("All Projects"),
            ]),
        ),
      S.listItem()
        .title("Team")
        .child(
          S.list()
            .title("Team")
            .items([
              singleton(S, "teamSection", "Section Settings"),
              S.divider(),
              S.documentTypeListItem("teamMember").title("All Team Members"),
            ]),
        ),
      S.listItem()
        .title("Publications")
        .child(
          S.list()
            .title("Publications")
            .items([
              singleton(S, "publicationsSection", "Section Settings"),
              S.divider(),
              S.documentTypeListItem("publication").title("All Publications"),
            ]),
        ),
      S.listItem()
        .title("Ventures")
        .child(
          S.list()
            .title("Ventures")
            .items([
              singleton(S, "venturesSection", "Section Settings"),
              S.divider(),
              S.documentTypeListItem("venture").title("All Ventures"),
            ]),
        ),
      singleton(S, "contactSection", "Contact"),
      S.divider(),
      singleton(S, "siteSettings", "Site Settings"),
      S.divider(),
      S.listItem()
        .title("Internal")
        .child(
          S.list()
            .title("Internal")
            .items([
              S.documentTypeListItem("serviceCategory").title("Service Categories"),
            ]),
        ),
    ]);
