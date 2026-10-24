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

function statusOf(row) {
  if (row.cancelled) return "cancelled";
  if (row.minutes <= 0) return "now";
  if (row.delay > 0) return "delayed";
  return "ok";
}

function statusText(row) {
  if (row.cancelled) return "Inställd";
  if (row.delay > 0) return `+${row.delay} min`;
  return "";
}

function rowToHtml(row) {
  return `
    <li class="row" data-id="${row.id}" data-color="${lineColor(row)}" data-status="${statusOf(row)}">
      <span class="row__line">${escapeHtml(row.line)}</span>
      <span class="row__destination">${escapeHtml(row.destination)}</span>
      <span class="row__time">${escapeHtml(row.display)}</span>
      <span class="row__status">${statusText(row)}</span>
    </li>`;
}

export function renderRows(listEl, rows) {
  if (rows.length === 0) {
    listEl.innerHTML = `<li class="empty">Inga avgångar att visa.</li>`;
  } else {
    listEl.innerHTML = rows.map(rowToHtml).join("");
  }
}

// ---------- Step 4 – reduce (the numbers are computed in main.js) ----------

function nextToHtml(row) {
  return `<span class="chip" data-color="${lineColor(row)}">${escapeHtml(row.line)} <strong>${escapeHtml(row.display)}</strong></span>`;
}

export function renderSummary(el, summary) {
  const modeChips = Object.keys(summary.counts).map(
    (mode) => `<span class="chip">${MODE_LABEL[mode]} <strong>${summary.counts[mode]}</strong></span>`,
  );

  let cancelledClass = "chip";
  if (summary.cancelled > 0) {
    cancelledClass = "chip chip--warn";
  }

  let metroSoon = "Nej";
  if (summary.metroSoon) {
    metroSoon = "Ja";
  }

  el.innerHTML = `
    ${modeChips.join("")}
    <span class="${cancelledClass}">Inställda <strong>${summary.cancelled}</strong></span>
    <span class="chip">Tunnelbana inom 5 min <strong>${metroSoon}</strong></span>
    <div class="next-per-line" aria-label="Nästa avgång per linje">
      ${Object.values(summary.next).map(nextToHtml).join("")}
    </div>`;
}

function deviationToHtml(deviation) {
  let className = "deviation";
  if (deviation.importance_level >= 7) {
    className = "deviation deviation--high";
  }
  return `<p class="${className}">${escapeHtml(deviation.message)}</p>`;
}

export function renderDeviations(el, deviations) {
  el.innerHTML = deviations.map(deviationToHtml).join("");
}
