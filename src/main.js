import { fetchBoard } from "./api.js";
import {
  toRow,
  visibleRows,
  countByMode,
  countCancelled,
  hasModeWithin,
  nextPerLine,
} from "./departures.js";
import { renderMeta, renderRows, renderSummary, renderDeviations } from "./render.js";

// Which data to show: ?source=live | snapshot | broken
const params = new URLSearchParams(location.search);
const source = params.get("source") || "snapshot";

const el = {
  meta: document.querySelector("#meta"),
  refresh: document.querySelector("#refresh"),
  filters: document.querySelector("#filters"),
  summary: document.querySelector("#summary"),
  rows: document.querySelector("#rows"),
  deviations: document.querySelector("#deviations"),
  status: document.querySelector("#status"),
};

// Everything the board knows right now.
const state = {
  rows: [],
};

function readFilters() {
  return {
    mode: el.filters.querySelector('input[name="mode"]:checked').value,
    soon: el.filters.querySelector('input[name="soon"]').checked,
    hideCancelled: el.filters.querySelector('input[name="hideCancelled"]').checked,
  };
}

function render() {
  const visible = visibleRows(state.rows, readFilters());

  renderSummary(el.summary, {
    counts: countByMode(state.rows),
    cancelled: countCancelled(state.rows),
    metroSoon: hasModeWithin(state.rows, "METRO", 5),
    next: nextPerLine(state.rows),
  });
  renderRows(el.rows, visible);
  el.status.textContent = `Visar ${visible.length} av ${state.rows.length} avgångar.`;
}

async function load() {
  try {
    const board = await fetchBoard(source);
    window.board = board;

    state.rows = board.departures.map((departure) => toRow(departure, board.now));

    renderMeta(el.meta, board.now, source);
    renderDeviations(el.deviations, board.deviations);
    render();
  } catch (error) {
    el.status.textContent = `Kunde inte hämta avgångar: ${error.message}`;
  }
}

el.filters.addEventListener("change", render);
el.refresh.addEventListener("click", load);
load();
