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
 *       PHOTOS_FOLDER_ID   =  <Drive folder ID containing the project photos>
 *
 *    To get the PHOTOS_FOLDER_ID: open the folder in Google Drive — the URL
 *    is `https://drive.google.com/drive/folders/<FOLDER_ID>`. Copy that ID.
 *    Drop your project photos into this folder and reference them from the
 *    sheet by exact filename in the `photoFilename` column.
 * 3. Reload the sheet. A "Comte Sync" menu appears (`onOpen` fires).
 * 4. (Optional) Triggers → Add Trigger:
 *       function: pullAll_
 *       event source: time-driven
 *       interval: every 5 minutes
 *    This keeps the sheet in sync with edits made in Sanity Studio.
 *
 * HEADER ROW CONTRACT (row 1, exact names — column order doesn't matter)
 *     ID | Title | Year | Description | Customer | Contact | Mail | Phone |
 *     Main Category | All Categories | Scale | Method | photoFilename
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
 *     the Drive folder set by PHOTOS_FOLDER_ID. On push, the script uploads
 *     the file to Sanity and links it as the project's photo. If the
 *     filename hasn't changed since the last push, no re-upload happens.
 *     Leave empty to clear the photo on next push.
 *
 * TRIGGERS
 *   - onEdit (simple trigger): edits to a data row push that row immediately.
 *     Edits to Mail or Phone are ignored (they're read-only).
 *   - "Comte Sync" menu: Push current row / Push all / Pull all.
 */

// ─────────────────────────── Configuration ───────────────────────────

// The tab name inside the spreadsheet (NOT the spreadsheet's title). The
// spreadsheet itself is auto-detected via `SpreadsheetApp.getActive()`, so
// its name (e.g. "Nettsideprosjekter") doesn't matter — only this tab name.
var SHEET_NAME = "production";
var MULTI_SEP = " / ";
var API_VERSION = "v2024-01-01";

// Sheet header → internal field key
var HEADER_TO_FIELD = {
  "ID": "id",
  "Title": "title",
  "Year": "year",
  "Description": "description",
  "Customer": "customers",
  "Contact": "contact",
  "Mail": "mail",
  "Phone": "phone",
  "Main Category": "mainCategory",
  "All Categories": "allCategories",
  "Scale": "scale",
  "Method": "methods",
  "photoFilename": "photoFilename",
};

// Friendly category label (what users pick in the dropdown) → schema value
var CATEGORY_VALUES = {
  "Health & Care": "health",
  "Inclusion & Participation": "integration",
  "Urban Development": "urban",
  "Climate & Sustainability": "climate",
  "Digital Transformation": "digital",
  "Childhood & Education": "education",
  "Culture": "culture",
  "Policy": "policy",
};
var CATEGORY_LABELS = invert_(CATEGORY_VALUES);

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

// ─────────────────────────── Menu / triggers ───────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Comte Sync")
    .addItem("Push current row to Sanity", "menuPushCurrentRow")
    .addItem("Push all rows to Sanity",     "menuPushAll")
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
    if (row < 2) return;  // ignore header edits

    var headers = getHeaderMap_(sheet);
    var editedField = fieldForColumn_(headers, e.range.getColumn());
    // Mail and Phone are read-only mirrors.
    if (editedField === "mail" || editedField === "phone") return;

    pushRow_(sheet, row, headers);
  } catch (err) {
    Logger.log("onEdit error: " + err);
  }
}

function menuPushCurrentRow() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);
  var row = SpreadsheetApp.getActiveRange().getRow();
  if (row < 2) {
    SpreadsheetApp.getUi().alert("Select a data row first (row ≥ 2).");
    return;
  }
  pushRow_(sheet, row, getHeaderMap_(sheet));
  toast_("Row " + row + " pushed.");
}

function menuPushAll() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);
  var headers = getHeaderMap_(sheet);
  var lastRow = sheet.getLastRow();
  var ok = 0;
  var fail = 0;
  for (var r = 2; r <= lastRow; r++) {
    try {
      pushRow_(sheet, r, headers);
      ok++;
    } catch (err) {
      Logger.log("Row " + r + " failed: " + err);
      fail++;
    }
  }
  toast_("Pushed " + ok + " rows" + (fail ? ", " + fail + " failed (see logs)" : "") + ".");
}

function menuPullAll() {
  pullAll_();
  toast_("Pulled from Sanity.");
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
  var idCol = headers["ID"];
  var lastRow = sheet.getLastRow();
  var existing = {};
  if (idCol && lastRow >= 2) {
    var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var v = String(ids[i][0] || "").trim();
      if (v) existing[v] = i + 2;
    }
  }

  // Append cursor for projects without an existing row.
  var appendRow = Math.max(lastRow + 1, 2);
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
  if (!data.title || !String(data.title).trim()) return;  // skip empty rows

  // Resolve responsible (full name) → teamMember._id
  var responsibleId = null;
  if (data.contact && String(data.contact).trim()) {
    responsibleId = resolveTeamMember_(String(data.contact).trim());
    if (!responsibleId) {
      Logger.log("Row " + row + ": no teamMember matches '" + data.contact + "'");
    }
  }

  var doc = {
    _type: "project",
    title: String(data.title).trim(),
    slug: { _type: "slug", current: slugify_(String(data.title).trim()) },
    year: data.year !== "" && data.year != null ? Number(data.year) : null,
    summary: data.description ? String(data.description) : "",
    customers: parseMulti_(data.customers),
    mainCategory: CATEGORY_VALUES[String(data.mainCategory || "").trim()] || null,
    allCategories: parseMulti_(data.allCategories)
      .map(function (v) { return CATEGORY_VALUES[v]; })
      .filter(Boolean),
    scale: SCALE_VALUES[String(data.scale || "").trim()] || null,
    methods: parseMulti_(data.methods)
      .map(function (v) { return METHOD_VALUES[v]; })
      .filter(Boolean),
  };
  if (responsibleId) {
    doc.responsible = { _type: "reference", _ref: responsibleId };
  }

  var existingId = data.id && String(data.id).trim();

  // Resolve the project photo. Only touch `gallery` if the sheet has a
  // photoFilename column at all — otherwise the field is left out of the
  // doc and createOrReplace will clear it, which would wipe images uploaded
  // through Sanity Studio.
  if (headers["photoFilename"]) {
    doc.gallery = buildGallery_(
      String(data.photoFilename || "").trim(),
      existingId || null,
      String(data.title).trim()
    );
  }

  if (existingId) {
    doc._id = existingId;
    sanityMutate_([{ createOrReplace: doc }]);
  } else {
    var resp = sanityMutate_([{ create: doc }]);
    var newId = resp && resp.results && resp.results[0] && resp.results[0].id;
    if (newId && headers["ID"]) {
      sheet.getRange(row, headers["ID"]).setValue(newId);
    }
  }
}

// ─────────────────────────── Pull: Sanity → sheet ───────────────────────────

function writeProjectRow_(sheet, row, headers, p) {
  var customers = (p.customers && p.customers.length)
    ? p.customers
    : (p.client ? [p.client] : []);
  var allCats = (p.allCategories && p.allCategories.length) ? p.allCategories : (p.tags || []);
  var responsible = p.responsible || {};

  var writes = {
    "ID":              p._id || "",
    "Title":           p.title || "",
    "Year":            p.year || "",
    "Description":     p.summary || "",
    "Customer":        customers.join(MULTI_SEP),
    "Contact":         responsible.name || "",
    "Mail":            responsible.email || "",
    "Phone":           responsible.phone || "",
    "Main Category":   CATEGORY_LABELS[p.mainCategory] || "",
    "All Categories":  allCats.map(function (v) { return CATEGORY_LABELS[v]; }).filter(Boolean).join(MULTI_SEP),
    "Scale":           SCALE_LABELS[p.scale] || "",
    "Method":          (p.methods || []).map(function (v) { return METHOD_LABELS[v]; }).filter(Boolean).join(MULTI_SEP),
    "photoFilename":   p.photoFilename || "",
  };
  Object.keys(writes).forEach(function (header) {
    var col = headers[header];
    if (col) sheet.getRange(row, col).setValue(writes[header]);
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
        alt: altText || "",
        asset: { _type: "reference", _ref: current.ref },
      }];
    }
  }

  // (3) Upload a new asset.
  var blob = findDriveFile_(filename);
  if (!blob) {
    Logger.log("Photo not found in Drive folder: " + filename);
    return existingProjectId ? undefined : []; // leave gallery untouched on update, empty on create
  }
  var assetId = uploadImageToSanity_(blob, filename);
  if (!assetId) return [];

  return [{
    _key: shortKey_(),
    _type: "image",
    alt: altText || "",
    asset: { _type: "reference", _ref: assetId },
  }];
}

function findDriveFile_(filename) {
  var folderId = getProp_("PHOTOS_FOLDER_ID");
  var folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (err) {
    throw new Error("PHOTOS_FOLDER_ID points to a folder this script can't open: " + err);
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
  var lastCol = sheet.getLastColumn();
  var values = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < values.length; i++) {
    var name = String(values[i] || "").trim();
    if (name) map[name] = i + 1;
  }
  return map;
}

function fieldForColumn_(headers, col) {
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    if (headers[keys[i]] === col) return HEADER_TO_FIELD[keys[i]] || null;
  }
  return null;
}

function readRow_(sheet, row, headers) {
  var lastCol = sheet.getLastColumn();
  var values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
  var obj = {};
  Object.keys(headers).forEach(function (header) {
    var field = HEADER_TO_FIELD[header];
    if (!field) return;
    obj[field] = values[headers[header] - 1];
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
