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

// Lesson 2, step 2: a row that wasn't there at the last fetch gets data-new.
// Step 3: a row whose status changed (e.g. became delayed) gets data-changed.
function changeOf(row, oldRows) {
  const oldRow = oldRows.find((old) => old.id === row.id);
  if (oldRow === undefined) return "data-new";
  if (statusOf(oldRow) !== statusOf(row)) return "data-changed";
  return "";
}

// --i is the row's place in the list, so new rows can flip in one after another.
// It stops at 15, so a new row far down the list doesn't wait for seconds.
function rowToHtml(row, index, change) {
  return `
    <li class="row" data-id="${row.id}" data-color="${lineColor(row)}" data-status="${statusOf(row)}"
        style="--i: ${Math.min(index, 15)}" ${change}>
      <span class="row__line">${escapeHtml(row.line)}</span>
      <span class="row__destination">${escapeHtml(row.destination)}</span>
      <span class="row__time">${escapeHtml(row.display)}</span>
      <span class="row__status">${statusText(row)}</span>
    </li>`;
}

// oldRows: the rows from the fetch before, so we can tell what's new.
export function renderRows(listEl, rows, oldRows) {
  if (rows.length === 0) {
    listEl.innerHTML = `<li class="empty">Inga avgångar att visa.</li>`;
  } else {
    const html = rows.map((row, index) => rowToHtml(row, index, changeOf(row, oldRows)));
    listEl.innerHTML = html.join("");
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

// Lesson 2, step 4: like the rows, only new disruptions get data-new and slide in.
// newDeviations holds the same objects as deviations, so includes can find them.
function deviationToHtml(deviation, newDeviations) {
  let className = "deviation";
  if (deviation.importance_level >= 7) {
    className = "deviation deviation--high";
  }

  let change = "";
  if (newDeviations.includes(deviation)) {
    change = "data-new";
  }

  return `<p class="${className}" ${change}>${escapeHtml(deviation.message)}</p>`;
}

export function renderDeviations(el, deviations, newDeviations) {
  el.innerHTML = deviations.map((deviation) => deviationToHtml(deviation, newDeviations)).join("");
}
