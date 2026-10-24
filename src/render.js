// Turning data into HTML. Nothing in here fetches or decides – it only draws.

// Makes text safe to put in HTML, so a "<" in the data shows up as a "<".
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const MODE_LABEL = {
  METRO: "Tunnelbana",
  TRAIN: "Pendeltåg",
  TRAM: "Spårväg",
  BUS: "Buss",
  SHIP: "Båt",
  FERRY: "Båt",
};

// Which color the line badge gets.
function lineColor(row) {
  if (row.mode === "METRO") {
    if (row.group.includes("gröna")) return "green";
    if (row.group.includes("röda")) return "red";
    return "blue";
  }
  if (row.mode === "TRAIN") return "train";
  if (row.mode === "TRAM") return "tram";
  if (row.mode === "BUS") return "bus";
  return "other";
}

export function formatTime(date) {
  return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

export function renderMeta(el, now, source) {
  if (source === "snapshot") {
    el.textContent = `Sparad data från ${formatTime(now)}`;
  } else {
    el.textContent = `Live · ${formatTime(now)}`;
  }
}

// ---------- Step 1 – map ----------
// TODO: renderRows(listEl, rows) – map every row to an <li>, join, put in the list
