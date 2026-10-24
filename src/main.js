import { fetchBoard } from "./api.js";
import {
  toRow,
  visibleRows,
  countByMode,
  countCancelled,
  hasModeWithin,
  nextPerLine,
} from "./departures.js";
import { renderMeta, renderRows, renderSummary, renderDeviations, formatTime } from "./render.js";
import { wait, announce, shake } from "./feedback.js";

// Which data to show: ?source=live | snapshot | broken
// Pretend the network is slow: ?latency=1500 (milliseconds)
const params = new URLSearchParams(location.search);
const source = params.get("source") || "snapshot";
const latency = Number(params.get("latency") || 0);

const el = {
  board: document.querySelector("#board"),
  meta: document.querySelector("#meta"),
  refresh: document.querySelector("#refresh"),
  refreshLabel: document.querySelector(".refresh__label"),
  filters: document.querySelector("#filters"),
  summary: document.querySelector("#summary"),
  rows: document.querySelector("#rows"),
  deviations: document.querySelector("#deviations"),
  status: document.querySelector("#status"),
  announcer: document.querySelector("#announcer"),
};

// Everything the board knows right now.
const state = {
  rows: [],
  deviations: [],
  now: null,
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

// oldRows: the rows from the fetch before, so render.js can tell what's new.
function render(oldRows) {
  const visible = visibleRows(state.rows, readFilters());

  renderSummary(el.summary, {
    counts: countByMode(state.rows),
    cancelled: countCancelled(state.rows),
    metroSoon: hasModeWithin(state.rows, "METRO", 5),
    next: nextPerLine(state.rows),
  });
  renderRows(el.rows, visible, oldRows);
  el.status.textContent = `Visar ${visible.length} av ${state.rows.length} avgångar.`;
}

// ---------- Lesson 2, step 4 – disruptions slide in and are read out ----------

function showDeviations(deviations) {
  // Which disruptions weren't there at the last fetch?
  const newDeviations = deviations.filter(
    (deviation) => !state.deviations.some((old) => old.id === deviation.id),
  );
  state.deviations = deviations;

  renderDeviations(el.deviations, deviations, newDeviations);
  if (newDeviations.length > 0) {
    const messages = newDeviations.map((deviation) => deviation.message);
    announce(el.announcer, `Störning: ${messages.join(" ")}`);
  }
}

// ---------- Lesson 2, step 5 – when it goes wrong ----------
// Be honest: say what failed, keep showing what we have, and grey it out.

function showError(error) {
  setRefreshState("error");
  shake(el.refresh);
  el.board.dataset.state = "stale";

  // #status has aria-live, so screen readers hear this too.
  if (state.rows.length > 0) {
    el.status.textContent = `Kunde inte uppdatera (${error.message}). Visar avgångar från ${formatTime(state.now)}.`;
  } else {
    el.status.textContent = `Kunde inte hämta avgångar (${error.message}).`;
  }
}

async function load() {
  setRefreshState("loading");

  try {
    await wait(latency);
    const board = await fetchBoard(source);
    window.board = board;

    const oldRows = state.rows;
    state.rows = board.departures.map((departure) => toRow(departure, board.now));
    state.now = board.now;

    renderMeta(el.meta, board.now, source);
    showDeviations(board.deviations);
    render(oldRows);
    el.board.dataset.state = "fresh";
    setRefreshState("success");
  } catch (error) {
    showError(error);
  }
}

// A new filter shows the same rows as before, so nothing is new.
el.filters.addEventListener("change", () => render(state.rows));
el.refresh.addEventListener("click", load);
load();
