/**
 * Comte Bureau — Google Sheets ↔ Sanity sync for the `project` schema.
 *
 * SETUP
 * -----
 * 1. In the Google Sheet: Extensions → Apps Script. Replace the default
 *    Code.gs with this file's contents.
 * 2. In the Apps Script editor: Project Settings → Script Properties.
 *    Add four properties:
 *       SANITY_PROJECT_ID  =  <your sanity project id, e.g. "ab12cd34">
 *       SANITY_DATASET     =  production
 *       SANITY_TOKEN       =  <an Editor-or-Write API token from manage.sanity.io>
 *       PHOTOS_FOLDER_ID   =  <Drive folder ID only, e.g. 1TxB…>
 *                             A full Drive URL also works — the script extracts the ID.
 *    Drop your project photos into this folder and reference them from the
 *    sheet by exact filename in the `photoFilename` column.
 * 3. Reload the sheet. A "Comte Sync" menu appears (`onOpen` fires).
 * 4. (Optional) Triggers → Add Trigger:
 *       function: pullAll_
 *       event source: time-driven
 *       interval: every 5 minutes
 *    This keeps the sheet in sync with edits made in Sanity Studio.
 *
 * HEADER ROW CONTRACT (row 1 — column order doesn't matter)
 *     Title | Year | photoFilename | Description | Customer | Contact |
 *     Mail | phone | Main Category | All Categories | Scale | Method
 *
 * Optional: add an ID column if you want the script to write Sanity _ids
 * back after the first push (helps with updates). Not required for new imports.
 *
 * CELL FORMATS
 *   - Customer / All Categories / Method: multiple values joined by " / ".
 *   - Mail and Phone: READ-ONLY mirrors of the responsible team member.
 *     The script fills them on pull and never writes them back to Sanity.
 *   - Contact: the responsible team member's full name (first + last).
 *     The script resolves it to a teamMember document by name (case-insensitive).
 *   - ID: leave empty for new rows. The script fills it with the Sanity _id
 *     after the first push. From then on, edits to that row update that _id.
 *   - photoFilename: exact filename of the photo (e.g. "oslo-care.jpg") in
 *     the Drive folder set by PHOTOS_FOLDER_ID. Only when this cell has a
 *     filename does a push upload or replace the gallery. An empty cell
 *     leaves existing Sanity photos untouched (safe for the first push that
 *     only links row IDs). Omit the column entirely to never touch photos.
 *
 * TRIGGERS
 *   - onEdit (simple trigger): edits to a data row push that row immediately.
 *     Edits to Mail or Phone are ignored (they're read-only).
 *   - "Comte Sync" menu: Push current row / Push all / Pull all.
 *
 * NORWEGIAN TAB (Projects_norsk)
 *   Row 1: ID (required) | Title/Tittel | Description/Beskrivelse |
 *   Main Category/Hovedkategori | All Categories/Alle kategorier | Method/Metode
 *   Copy IDs from Projects_english after the first English push.
 *   Menu → "Push all Norwegian rows":
 *     • Patches `title.no` and `summary.no` on each project (never English or photos).
 *     • Reads Norwegian category/method labels from the sheet and updates the
 *       `projectTaxonomy` singleton in Sanity (CMS → Projects → Category & method labels).
 *   Category/method *values* on projects stay the same (`urban`, `health`, …); only
 *   display labels are translated.
 */

// ─────────────────────────── Configuration ───────────────────────────

// The tab name inside the spreadsheet (NOT the spreadsheet's title). The
// spreadsheet itself is auto-detected via `SpreadsheetApp.getActive()`, so
// its name (e.g. "Nettsideprosjekter") doesn't matter — only this tab name.
var SHEET_NAME = "Projects_english";
/** Norwegian translations — match rows to Sanity projects by ID column. */
var SHEET_NAME_NO = "Projects_norsk";
var HEADER_ROW = 1;  // row containing ID | Title | Year | …
var MULTI_SEP = " / ";
var API_VERSION = "v2024-01-01";

/** Read English (or legacy plain string) from a localeString/localeText field. */
function pickLocale_(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.en) return String(value.en);
    if (value.no) return String(value.no);
  }
  return "";
}

/** Write a plain sheet string as `{ en: value }` for localeString fields. */
function localeString_(value) {
  if (!value) return { en: "" };
  if (typeof value === "object" && (value.en !== undefined || value.no !== undefined)) {
    return value;
  }
  return { en: String(value).trim() };
}

function localeText_(value) {
  return localeString_(value);
}

// Internal field keys that must be present in row HEADER_ROW.
var REQUIRED_FIELDS = ["title"];

var REQUIRED_FIELDS_NO = ["id"];

/** Norwegian sheet columns (ID required; categories use Norwegian labels). */
var HEADER_ALIASES_NO = {
  "ID": "id",
  "Title": "titleNo",
  "Tittel": "titleNo",
  "Description": "descriptionNo",
  "Beskrivelse": "descriptionNo",
  "Main Category": "mainCategory",
  "Hovedkategori": "mainCategory",
  "All Categories": "allCategories",
  "Alle kategorier": "allCategories",
  "Method": "methods",
  "Metode": "methods",
  "Metoder": "methods",
};

var TAXONOMY_DOC_ID = "projectTaxonomy";

// Sheet column label → internal field key (must match row 1 labels exactly).
var HEADER_ALIASES = {
  "ID": "id",
  "Title": "title",
  "Year": "year",
  "photoFilename": "photoFilename",
  "Description": "description",
  "Customer": "customers",
  "Contact": "contact",
  "Mail": "mail",
  "Phone": "phone",
  "phone": "phone",
  "Main Category": "mainCategory",
  "All Categories": "allCategories",
  "Scale": "scale",
  "Scale (not used)": "scale",
  "Method": "methods",
};

// Friendly category label (English sheet) → schema value
var CATEGORY_VALUES = {
  "Health & Care": "health",
  "Inclusion & Participation": "integration",
  "Spaces & Places": "urban",
  "Urban Development": "urban",
  "Climate & Sustainability": "climate",
  "Digital Transformation": "digital",
  "Childhood & Education": "education",
  "Culture": "culture",
  "Policy": "policy",
};
var CATEGORY_LABELS = invert_(CATEGORY_VALUES);

// Norwegian sheet labels → schema value (add aliases to match your dropdowns)
var CATEGORY_VALUES_NO = {
  "Helse og omsorg": "health",
  "Helse & omsorg": "health",
  "Inkludering og deltakelse": "integration",
  "Rom og steder": "urban",
  "Rom & steder": "urban",
  "Byutvikling": "urban",
  "Klima og bærekraft": "climate",
  "Digital transformasjon": "digital",
  "Barndom og utdanning": "education",
  "Kultur": "culture",
  "Politikk": "policy",
};
var CATEGORY_LABELS_NO = invert_(CATEGORY_VALUES_NO);

var SCALE_VALUES = {
  "Municipal": "municipal",
  "Regional": "regional",
  "National": "national",
  "International": "international",
};
var SCALE_LABELS = invert_(SCALE_VALUES);

var METHOD_VALUES = {
  "Research": "research",
  "Co-design": "codesign",
  "Implementation": "implementation",
  "Strategy": "strategy",
  "Foresight": "foresight",
};
var METHOD_LABELS = invert_(METHOD_VALUES);

var METHOD_VALUES_NO = {
  "Forskning": "research",
  "Samdesign": "codesign",
  "Medvirkningsdesign": "codesign",
  "Co-design": "codesign",
  "Implementering": "implementation",
  "Strategi": "strategy",
  "Fremtidsarbeid": "foresight",
  "Foresight": "foresight",
};
var METHOD_LABELS_NO = invert_(METHOD_VALUES_NO);

// ─────────────────────────── Menu / triggers ───────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Comte Sync")
    .addItem("Diagnose sheet + Sanity",     "menuDiagnose")
    .addSeparator()
    .addItem("Push current row to Sanity", "menuPushCurrentRow")
    .addItem("Push all rows to Sanity",     "menuPushAll")
    .addSeparator()
    .addItem("Push all Norwegian rows",   "menuPushAllNorwegian")
    .addSeparator()
    .addItem("Pull all from Sanity",        "menuPullAll")
    .addToUi();
}

function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    if (sheet.getName() !== SHEET_NAME) return;
    var row = e.range.getRow();
    if (row <= HEADER_ROW) return;  // ignore header edits

    var headers = getHeaderMap_(sheet);
    validateHeaders_(headers);
    var editedField = fieldForColumn_(headers, e.range.getColumn());
    // Mail and Phone are read-only mirrors.
    if (editedField === "mail" || editedField === "phone") return;

    var result = pushRow_(sheet, row, headers);
    if (result.status === "pushed") {
      toast_("Row " + row + " pushed to Sanity.");
    }
  } catch (err) {
    Logger.log("onEdit error: " + err);
    toast_("Push failed: " + err);
  }
}

function menuDiagnose() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(
      "Sheet tab not found: \"" + SHEET_NAME + "\"\n\n" +
      "Rename your tab to match SHEET_NAME in the script, or update SHEET_NAME."
    );
    return;
  }

  var headers = getHeaderMap_(sheet);
  var missing = missingHeaders_(headers);
  var rawHeaders = getRawHeaders_(sheet);
  var unrecognized = getUnrecognizedHeaders_(sheet);
  var mappedFields = Object.keys(headers).join(", ") || "(none)";
  var lines = [
    "Tab: " + sheet.getName(),
    "Header row: " + HEADER_ROW,
    "Row labels: " + (rawHeaders.join(", ") || "(none)"),
    "Mapped fields: " + mappedFields,
  ];

  if (unrecognized.length) {
    lines.push("Unrecognized columns (ignored): " + unrecognized.join(", "));
  }

  if (missing.length) {
    lines.push("");
    lines.push("MISSING required field: " + missing.join(", ") + " (needs a Title column)");
  } else {
    lines.push("");
    lines.push("Headers: OK");
  }

  try {
    var count = sanityQuery_('count(*[_type == "project"])', {}).result;
    lines.push("Sanity connection: OK");
    lines.push("Project count in Sanity: " + count);
    lines.push("Project: " + getProp_("SANITY_PROJECT_ID") + " / " + getProp_("SANITY_DATASET"));
  } catch (err) {
    lines.push("");
    lines.push("Sanity connection FAILED:");
    lines.push(String(err));
  }

  SpreadsheetApp.getUi().alert(lines.join("\n"));
}

function menuPushCurrentRow() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);
  var row = SpreadsheetApp.getActiveRange().getRow();
  if (row <= HEADER_ROW) {
    SpreadsheetApp.getUi().alert("Select a data row first (row > " + HEADER_ROW + ").");
    return;
  }
  var headers = getHeaderMap_(sheet);
  validateHeaders_(headers);
  var result = pushRow_(sheet, row, headers);
  if (result.status === "pushed") {
    toast_("Row " + row + " pushed. Sanity ID: " + result.id);
  } else if (result.status === "empty") {
    SpreadsheetApp.getUi().alert("Row " + row + " has no Title — nothing to push.");
  } else {
    SpreadsheetApp.getUi().alert("Row " + row + " was skipped: " + result.reason);
  }
}

function menuPushAll() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);
  var headers = getHeaderMap_(sheet);
  validateHeaders_(headers);
  var lastRow = sheet.getLastRow();
  var pushed = 0;
  var skipped = 0;
  var empty = 0;
  var fail = 0;
  var firstError = "";
  for (var r = HEADER_ROW + 1; r <= lastRow; r++) {
    try {
      var result = pushRow_(sheet, r, headers);
      if (result.status === "pushed") pushed++;
      else if (result.status === "empty") empty++;
      else skipped++;
    } catch (err) {
      var errMsg = "Row " + r + ": " + err;
      Logger.log(errMsg);
      if (!firstError) firstError = String(err);
      fail++;
    }
  }
  var msg = "Pushed " + pushed + " to Sanity";
  if (empty) msg += ", " + empty + " empty (no Title)";
  if (skipped) msg += ", " + skipped + " skipped";
  if (fail) msg += ", " + fail + " failed (see Executions log)";
  toast_(msg + ".");
  if (pushed === 0) {
    var detail = firstError
      ? "\n\nFirst error:\n" + firstError
      : "\n\nIf pushed = 0, check that row " + HEADER_ROW +
        " has a column named exactly \"Title\" and data rows have titles filled in.";
    SpreadsheetApp.getUi().alert(msg + "." + detail);
  }
}

function menuPullAll() {
  pullAll_();
  toast_("Pulled from Sanity.");
}

/**
 * Push every data row on Projects_norsk. Each row must have a Sanity project ID
 * (copy from Projects_english after the first English push). Only `title.no` and
 * `summary.no` are written; English copy and gallery are never sent.
 */
function menuPushAllNorwegian() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_NO);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(
      "Sheet tab not found: \"" + SHEET_NAME_NO + "\"\n\n" +
      "Add a tab with that exact name for Norwegian project copy."
    );
    return;
  }
  var headers = getHeaderMapForAliases_(sheet, HEADER_ALIASES_NO);
  validateHeadersFor_(headers, REQUIRED_FIELDS_NO, HEADER_ALIASES_NO);
  var lastRow = sheet.getLastRow();
  var pushed = 0;
  var skipped = 0;
  var empty = 0;
  var fail = 0;
  var firstError = "";
  var taxonomyNo = { categories: {}, methods: {} };

  for (var r = HEADER_ROW + 1; r <= lastRow; r++) {
    try {
      collectNorwegianTaxonomyFromRow_(sheet, r, headers, taxonomyNo);
      var result = pushNorwegianRow_(sheet, r, headers);
      if (result.status === "pushed") pushed++;
      else if (result.status === "empty") empty++;
      else skipped++;
    } catch (err) {
      var errMsg = "Row " + r + ": " + err;
      Logger.log(errMsg);
      if (!firstError) firstError = String(err);
      fail++;
    }
  }

  try {
    pushTaxonomyLabelsToSanity_(taxonomyNo);
  } catch (err) {
    Logger.log("Taxonomy push failed: " + err);
    if (!firstError) firstError = "Taxonomy: " + err;
    fail++;
  }

  var msg = "Norwegian: pushed " + pushed + " project text fields";
  if (empty) msg += ", " + empty + " empty (no Title/Description)";
  if (skipped) msg += ", " + skipped + " skipped";
  if (fail) msg += ", " + fail + " failed (see Executions log)";
  msg += "; taxonomy labels synced to CMS";
  toast_(msg + ".");
  if (pushed === 0 && fail > 0) {
    var detail = firstError
      ? "\n\nFirst error:\n" + firstError
      : "\n\nEach row needs an ID (Sanity _id) and at least Title or Description in Norwegian.";
    SpreadsheetApp.getUi().alert(msg + "." + detail);
  }
}

// Time-driven trigger entrypoint (Triggers → Add Trigger → function: pullAll_)
function pullAll_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);
  var headers = getHeaderMap_(sheet);

  var query = '*[_type == "project"] | order(year desc) {' +
    '  _id, title, year, summary, customers, client, mainCategory,' +
    '  allCategories, tags, scale, methods,' +
    '  "responsible": responsible-> { name, email, phone },' +
    '  "photoFilename": gallery[0].asset->originalFilename' +
    '}';
  var result = sanityQuery_(query, {});
  var projects = (result && result.result) || [];

  // Build a row index by existing _id
  var idCol = headers["id"];
  var lastRow = sheet.getLastRow();
  var existing = {};
  if (idCol && lastRow > HEADER_ROW) {
    var ids = sheet.getRange(HEADER_ROW + 1, idCol, lastRow - HEADER_ROW, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var v = String(ids[i][0] || "").trim();
      if (v) existing[v] = i + HEADER_ROW + 1;
    }
  }

  // Append cursor for projects without an existing row.
  var appendRow = Math.max(lastRow + 1, HEADER_ROW + 1);
  for (var p = 0; p < projects.length; p++) {
    var proj = projects[p];
    var targetRow;
    if (existing[proj._id]) {
      targetRow = existing[proj._id];
    } else {
      targetRow = appendRow;
      appendRow++;
    }
    writeProjectRow_(sheet, targetRow, headers, proj);
  }
}

// ─────────────────────────── Push: sheet → Sanity ───────────────────────────

function pushRow_(sheet, row, headers) {
  var data = readRow_(sheet, row, headers);
  if (!data.title || !String(data.title).trim()) {
    return { status: "empty" };
  }

  // Resolve responsible (full name) → teamMember._id
  var responsibleId = null;
  if (data.contact && String(data.contact).trim()) {
    try {
      responsibleId = resolveTeamMember_(String(data.contact).trim());
      if (!responsibleId) {
        Logger.log("Row " + row + ": no teamMember matches '" + data.contact + "'");
      }
    } catch (err) {
      Logger.log("Row " + row + ": teamMember lookup failed — pushing without responsible. " + err);
    }
  }

  var titleText = String(data.title).trim();
  var doc = {
    _type: "project",
    title: localeString_(titleText),
    slug: { _type: "slug", current: slugify_(titleText) },
    year: data.year !== "" && data.year != null ? Number(data.year) : null,
    summary: localeText_(data.description ? String(data.description) : ""),
    customers: parseMulti_(data.customers),
    mainCategory: resolveCategoryValue_(data.mainCategory, false) || null,
    allCategories: parseMulti_(data.allCategories)
      .map(function (v) { return resolveCategoryValue_(v, false); })
      .filter(Boolean),
    scale: SCALE_VALUES[String(data.scale || "").trim()] || null,
    methods: parseMulti_(data.methods)
      .map(function (v) { return resolveMethodValue_(v, false); })
      .filter(Boolean),
  };
  if (responsibleId) {
    doc.responsible = { _type: "reference", _ref: responsibleId };
  }

  var sheetId = data.id && String(data.id).trim();
  var existingId = sheetId || findProjectIdBySlug_(titleText);
  var hadSheetId = !!sheetId;

  var photoFilename = headers["photoFilename"]
    ? String(data.photoFilename || "").trim()
    : "";

  if (existingId) {
    var patch = { id: existingId, set: projectFieldsForPatch_(doc) };
    if (photoFilename) {
      var gallery = buildGallery_(photoFilename, existingId, titleText);
      if (gallery !== undefined) patch.set.gallery = gallery;
    }
    sanityMutate_([{ patch: patch }]);
    if (!hadSheetId && headers["id"]) {
      sheet.getRange(row, headers["id"]).setValue(existingId);
    }
    return {
      status: "pushed",
      id: existingId,
      mode: hadSheetId ? "update" : "linked",
    };
  }

  if (photoFilename) {
    var newGallery = buildGallery_(photoFilename, null, titleText);
    if (newGallery !== undefined) doc.gallery = newGallery;
  }

  var resp = sanityMutate_([{ create: doc }]);
  var newId = resp && resp.results && resp.results[0] && resp.results[0].id;
  if (newId && headers["id"]) {
    sheet.getRange(row, headers["id"]).setValue(newId);
  }
  return { status: "pushed", id: newId, mode: "create" };
}

/** Find an existing Sanity project by slug derived from the sheet title. */
function findProjectIdBySlug_(titleText) {
  var slug = slugify_(titleText);
  if (!slug) return null;
  var result = sanityQuery_(
    '*[_type == "project" && slug.current == $slug][0]._id',
    { slug: slug }
  );
  return (result && result.result) || null;
}

/** Patch payload — omits gallery so empty photoFilename cannot clear images. */
function projectFieldsForPatch_(doc) {
  var set = {};
  Object.keys(doc).forEach(function (key) {
    if (key === "_type" || key === "_id" || key === "gallery") return;
    set[key] = doc[key];
  });
  return set;
}

// ─────────────────────────── Push: Norwegian sheet → Sanity (locale only) ───

function resolveCategoryValue_(label, useNorwegian) {
  var key = String(label || "").trim();
  if (!key) return null;
  if (useNorwegian && CATEGORY_VALUES_NO[key]) return CATEGORY_VALUES_NO[key];
  if (CATEGORY_VALUES[key]) return CATEGORY_VALUES[key];
  if (useNorwegian && CATEGORY_VALUES[key]) return CATEGORY_VALUES[key];
  return null;
}

function resolveMethodValue_(label, useNorwegian) {
  var key = String(label || "").trim();
  if (!key) return null;
  if (useNorwegian && METHOD_VALUES_NO[key]) return METHOD_VALUES_NO[key];
  if (METHOD_VALUES[key]) return METHOD_VALUES[key];
  if (useNorwegian && METHOD_VALUES[key]) return METHOD_VALUES[key];
  return null;
}

/** Record Norwegian display strings seen in the sheet (for taxonomy sync). */
function collectNorwegianTaxonomyFromRow_(sheet, row, headers, taxonomyNo) {
  var data = readRow_(sheet, row, headers);
  if (headers.mainCategory && data.mainCategory) {
    var catVal = resolveCategoryValue_(data.mainCategory, true);
    if (catVal) taxonomyNo.categories[catVal] = String(data.mainCategory).trim();
  }
  if (headers.allCategories && data.allCategories) {
    parseMulti_(data.allCategories).forEach(function (label) {
      var catVal = resolveCategoryValue_(label, true);
      if (catVal) taxonomyNo.categories[catVal] = label;
    });
  }
  if (headers.methods && data.methods) {
    parseMulti_(data.methods).forEach(function (label) {
      var methodVal = resolveMethodValue_(label, true);
      if (methodVal) taxonomyNo.methods[methodVal] = label;
    });
  }
}

/**
 * Upsert `projectTaxonomy` in Sanity: English labels from script defaults,
 * Norwegian labels from the sheet (plus CATEGORY_LABELS_NO / METHOD_LABELS_NO).
 */
function pushTaxonomyLabelsToSanity_(taxonomyNo) {
  var categories = [];
  Object.keys(CATEGORY_LABELS).forEach(function (value) {
    var labelNo =
      (taxonomyNo.categories && taxonomyNo.categories[value]) ||
      CATEGORY_LABELS_NO[value] ||
      "";
    categories.push({
      _key: value,
      value: value,
      label: {
        en: CATEGORY_LABELS[value] || value,
        no: labelNo,
      },
    });
  });

  var methods = [];
  Object.keys(METHOD_LABELS).forEach(function (value) {
    var labelNo =
      (taxonomyNo.methods && taxonomyNo.methods[value]) ||
      METHOD_LABELS_NO[value] ||
      "";
    methods.push({
      _key: value,
      value: value,
      label: {
        en: METHOD_LABELS[value] || value,
        no: labelNo,
      },
    });
  });

  sanityMutate_([
    {
      createOrReplace: {
        _id: TAXONOMY_DOC_ID,
        _type: "projectTaxonomy",
        categories: categories,
        methods: methods,
      },
    },
  ]);
}

/**
 * Patch `title.no` / `summary.no` on an existing project. Does not create
 * projects, change English fields, or touch gallery / slug / metadata.
 */
function pushNorwegianRow_(sheet, row, headers) {
  var data = readRow_(sheet, row, headers);
  var existingId = data.id && String(data.id).trim();
  if (!existingId) {
    return { status: "skipped", reason: "missing ID" };
  }

  var titleNo = data.titleNo != null ? String(data.titleNo).trim() : "";
  var descriptionNo = data.descriptionNo != null ? String(data.descriptionNo).trim() : "";
  if (!titleNo && !descriptionNo) {
    return { status: "empty" };
  }

  var found = sanityQuery_('*[_id == $id][0]._id', { id: existingId });
  if (!found || !found.result) {
    return { status: "skipped", reason: "no project with ID " + existingId };
  }

  var sets = {};
  if (titleNo) sets["title.no"] = titleNo;
  if (descriptionNo) sets["summary.no"] = descriptionNo;

  sanityMutate_([{ patch: { id: existingId, set: sets } }]);
  return { status: "pushed", id: existingId, fields: Object.keys(sets) };
}

// ─────────────────────────── Pull: Sanity → sheet ───────────────────────────

function writeProjectRow_(sheet, row, headers, p) {
  var customers = (p.customers && p.customers.length)
    ? p.customers
    : (p.client ? [p.client] : []);
  var allCats = (p.allCategories && p.allCategories.length) ? p.allCategories : (p.tags || []);
  var responsible = p.responsible || {};

  var writes = {
    id:              p._id || "",
    title:           pickLocale_(p.title),
    year:            p.year || "",
    description:     pickLocale_(p.summary),
    customers:       customers.join(MULTI_SEP),
    contact:         responsible.name || "",
    mail:            responsible.email || "",
    phone:           responsible.phone || "",
    mainCategory:    CATEGORY_LABELS[p.mainCategory] || "",
    allCategories:   allCats.map(function (v) { return CATEGORY_LABELS[v]; }).filter(Boolean).join(MULTI_SEP),
    scale:           SCALE_LABELS[p.scale] || "",
    methods:         (p.methods || []).map(function (v) { return METHOD_LABELS[v]; }).filter(Boolean).join(MULTI_SEP),
    photoFilename:   p.photoFilename || "",
  };
  Object.keys(writes).forEach(function (field) {
    var col = headers[field];
    if (col) sheet.getRange(row, col).setValue(writes[field]);
  });
}

// ─────────────────────────── Photo upload ───────────────────────────

/**
 * Returns the `gallery` array for a project. Three regimes:
 *   1. `filename` is empty → []  (clears the photo).
 *   2. `filename` matches what's already on this project in Sanity → reuse
 *      the existing asset reference (no upload, no extra bytes).
 *   3. Otherwise → look up the file in the Drive folder, upload to Sanity,
 *      and reference the new asset.
 */
function buildGallery_(filename, existingProjectId, altText) {
  if (!filename) return [];

  // (2) Cheap reuse: if the existing project already references an asset
  // whose originalFilename matches, keep that asset.
  if (existingProjectId) {
    var existing = sanityQuery_(
      '*[_id == $id][0]{ "ref": gallery[0].asset._ref, "name": gallery[0].asset->originalFilename }',
      { id: existingProjectId }
    );
    var current = existing && existing.result;
    if (current && current.ref && current.name === filename) {
      return [{
        _key: shortKey_(),
        _type: "image",
        alt: localeString_(altText || ""),
        asset: { _type: "reference", _ref: current.ref },
      }];
    }
  }

  // (3) Upload a new asset.
  try {
    var blob = findDriveFile_(filename);
    if (!blob) {
      Logger.log("Photo not found in Drive folder: " + filename);
      return existingProjectId ? undefined : [];
    }
    var assetId = uploadImageToSanity_(blob, filename);
    if (!assetId) return existingProjectId ? undefined : [];

    return [{
      _key: shortKey_(),
      _type: "image",
      alt: localeString_(altText || ""),
      asset: { _type: "reference", _ref: assetId },
    }];
  } catch (err) {
    Logger.log("Photo upload skipped for " + filename + ": " + err);
    return existingProjectId ? undefined : [];
  }
}

function normalizeDriveFolderId_(raw) {
  var value = String(raw || "").trim();
  if (!value) return value;
  // Accept pasted Drive URLs — extract the folder ID segment.
  var match = value.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return value;
}

function findDriveFile_(filename) {
  var folderId = normalizeDriveFolderId_(getProp_("PHOTOS_FOLDER_ID"));
  if (!folderId) {
    Logger.log("PHOTOS_FOLDER_ID is empty — skipping photo lookup");
    return null;
  }
  var folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (err) {
    Logger.log("PHOTOS_FOLDER_ID invalid or inaccessible (" + folderId + "): " + err);
    return null;
  }
  var files = folder.getFilesByName(filename);
  if (!files.hasNext()) return null;
  return files.next().getBlob();
}

function uploadImageToSanity_(blob, filename) {
  var url = sanityBase_() + "/assets/images/" + getProp_("SANITY_DATASET") +
    "?filename=" + encodeURIComponent(filename);
  var response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: blob.getContentType(),
    headers: { Authorization: "Bearer " + getProp_("SANITY_TOKEN") },
    payload: blob.getBytes(),
    muteHttpExceptions: true,
  });
  var result = parseResponse_(response, "asset upload");
  return result && result.document && result.document._id;
}

// ─────────────────────────── Sanity HTTP API ───────────────────────────

function sanityQuery_(query, params) {
  var url = sanityBase_() + "/data/query/" + getProp_("SANITY_DATASET");
  var response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + getProp_("SANITY_TOKEN") },
    payload: JSON.stringify({ query: query, params: params || {} }),
    muteHttpExceptions: true,
  });
  return parseResponse_(response, "query");
}

function sanityMutate_(mutations) {
  var url = sanityBase_() + "/data/mutate/" + getProp_("SANITY_DATASET") + "?returnIds=true";
  var response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + getProp_("SANITY_TOKEN") },
    payload: JSON.stringify({ mutations: mutations }),
    muteHttpExceptions: true,
  });
  return parseResponse_(response, "mutate");
}

function sanityBase_() {
  return "https://" + getProp_("SANITY_PROJECT_ID") + ".api.sanity.io/" + API_VERSION;
}

function parseResponse_(response, label) {
  var code = response.getResponseCode();
  var body = response.getContentText();
  if (code >= 300) {
    throw new Error("Sanity " + label + " failed (" + code + "): " + body);
  }
  return JSON.parse(body);
}

// teamMember lookup cache (per script invocation)
var TEAM_CACHE = {};
function resolveTeamMember_(name) {
  var key = String(name).trim().toLowerCase();
  if (key in TEAM_CACHE) return TEAM_CACHE[key];
  var query = '*[_type == "teamMember" && lower(name) == $name][0]._id';
  var result = sanityQuery_(query, { name: key });
  var id = (result && result.result) || null;
  TEAM_CACHE[key] = id;
  return id;
}

// ─────────────────────────── Utilities ───────────────────────────

function getProp_(key) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v) throw new Error("Missing Script Property: " + key);
  return v;
}

function getHeaderMap_(sheet) {
  return getHeaderMapForAliases_(sheet, HEADER_ALIASES);
}

function getHeaderMapForAliases_(sheet, aliases) {
  var lastCol = sheet.getLastColumn();
  var values = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < values.length; i++) {
    var name = String(values[i] || "").trim();
    if (!name) continue;
    var field = aliases[name];
    if (field) map[field] = i + 1;
  }
  return map;
}

function getRawHeaders_(sheet) {
  var lastCol = sheet.getLastColumn();
  var values = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];
  var list = [];
  for (var i = 0; i < values.length; i++) {
    var name = String(values[i] || "").trim();
    if (name) list.push(name);
  }
  return list;
}

function getUnrecognizedHeaders_(sheet) {
  var lastCol = sheet.getLastColumn();
  var values = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];
  var unknown = [];
  for (var i = 0; i < values.length; i++) {
    var name = String(values[i] || "").trim();
    if (name && !HEADER_ALIASES[name]) unknown.push(name);
  }
  return unknown;
}

function missingHeaders_(headers) {
  var missing = [];
  for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
    if (!headers[REQUIRED_FIELDS[i]]) missing.push(REQUIRED_FIELDS[i]);
  }
  return missing;
}

function validateHeaders_(headers) {
  validateHeadersFor_(headers, REQUIRED_FIELDS, HEADER_ALIASES);
}

function validateHeadersFor_(headers, requiredFields, aliases) {
  var missing = [];
  for (var i = 0; i < requiredFields.length; i++) {
    if (!headers[requiredFields[i]]) missing.push(requiredFields[i]);
  }
  if (!missing.length) return;
  var labelForField = { id: "ID", title: "Title", titleNo: "Title", descriptionNo: "Description" };
  var labels = missing.map(function (f) { return labelForField[f] || f; });
  throw new Error(
    "Missing header row columns: " + labels.join(", ") +
    ". Expected one of: " + Object.keys(aliases).join(", ") +
    ". Mapped: " + Object.keys(headers).join(", ")
  );
}

function fieldForColumn_(headers, col) {
  var fields = Object.keys(headers);
  for (var i = 0; i < fields.length; i++) {
    if (headers[fields[i]] === col) return fields[i];
  }
  return null;
}

function readRow_(sheet, row, headers) {
  var lastCol = sheet.getLastColumn();
  var values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
  var obj = {};
  Object.keys(headers).forEach(function (field) {
    obj[field] = values[headers[field] - 1];
  });
  return obj;
}

function parseMulti_(cell) {
  if (cell == null) return [];
  return String(cell)
    .split(MULTI_SEP)
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

function slugify_(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function invert_(obj) {
  var out = {};
  Object.keys(obj).forEach(function (k) { out[obj[k]] = k; });
  return out;
}

function shortKey_() {
  return Utilities.getUuid().replace(/-/g, "").slice(0, 12);
}

function toast_(message) {
  SpreadsheetApp.getActive().toast(message, "Comte Sync", 4);
}
