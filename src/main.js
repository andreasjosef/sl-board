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
import { wait } from "./feedback.js";

// Which data to show: ?source=live | snapshot | broken
// Pretend the network is slow: ?latency=1500 (milliseconds)
const params = new URLSearchParams(location.search);
const source = params.get("source") || "snapshot";
const latency = Number(params.get("latency") || 0);

const el = {
  meta: document.querySelector("#meta"),
  refresh: document.querySelector("#refresh"),
  refreshLabel: document.querySelector(".refresh__label"),
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

// ---------- Lesson 2, step 1 – the refresh button has four states ----------

const REFRESH_LABEL = {
  idle: "Uppdatera",
  loading: "Hämtar…",
  success: "Uppdaterad",
  error: "Försök igen",
};

let resetTimer;

function setRefreshState(refreshState) {
  el.refresh.dataset.state = refreshState;
  el.refreshLabel.textContent = REFRESH_LABEL[refreshState];
  el.refresh.disabled = refreshState === "loading";

  // Success and error are moments, not places to stay: back to idle after 1.5 s.
  // clearTimeout stops an older timer from resetting the button in the middle of a new fetch.
  clearTimeout(resetTimer);
  if (refreshState === "success" || refreshState === "error") {
    resetTimer = setTimeout(() => setRefreshState("idle"), 1500);
  }
}

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
  setRefreshState("loading");

  try {
    await wait(latency);
    const board = await fetchBoard(source);
    window.board = board;

    state.rows = board.departures.map((departure) => toRow(departure, board.now));

    renderMeta(el.meta, board.now, source);
    renderDeviations(el.deviations, board.deviations);
    render();
    setRefreshState("success");
  } catch (error) {
    el.status.textContent = `Kunde inte hämta avgångar: ${error.message}`;
    setRefreshState("error");
  }
}

el.filters.addEventListener("change", render);
el.refresh.addEventListener("click", load);
load();
