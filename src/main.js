import { fetchBoard } from "./api.js";
import { renderMeta } from "./render.js";

// Which data to show: ?source=live | snapshot | broken
const params = new URLSearchParams(location.search);
const source = params.get("source") || "snapshot";

const el = {
  meta: document.querySelector("#meta"),
  refresh: document.querySelector("#refresh"),
  status: document.querySelector("#status"),
};

async function load() {
  try {
    const board = await fetchBoard(source);

    // Step 0 – explore the data. Open DevTools → Console and try:
    //   board.departures[0]
    //   board.departures[0].line
    window.board = board;
    console.log(board.departures);

    renderMeta(el.meta, board.now, source);
    el.status.textContent = `${board.departures.length} avgångar hämtade.`;
  } catch (error) {
    el.status.textContent = `Kunde inte hämta avgångar: ${error.message}`;
  }
}

el.refresh.addEventListener("click", load);
load();
