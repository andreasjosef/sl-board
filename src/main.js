import { fetchBoard } from "./api.js";
import { toRow } from "./departures.js";
import { renderMeta, renderRows, renderDeviations } from "./render.js";

// Which data to show: ?source=live | snapshot | broken
const params = new URLSearchParams(location.search);
const source = params.get("source") || "snapshot";

const el = {
  meta: document.querySelector("#meta"),
  refresh: document.querySelector("#refresh"),
  rows: document.querySelector("#rows"),
  deviations: document.querySelector("#deviations"),
  status: document.querySelector("#status"),
};

async function load() {
  try {
    const board = await fetchBoard(source);
    window.board = board;

    // map: raw departures → rows the board can show
    const rows = board.departures.map((departure) => toRow(departure, board.now));

    renderMeta(el.meta, board.now, source);
    renderRows(el.rows, rows);
    renderDeviations(el.deviations, board.deviations);
    el.status.textContent = `${rows.length} avgångar.`;
  } catch (error) {
    el.status.textContent = `Kunde inte hämta avgångar: ${error.message}`;
  }
}

el.refresh.addEventListener("click", load);
load();
