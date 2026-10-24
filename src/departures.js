// Lesson 1 – higher-order functions.
// Every function in here takes data and returns new data. Nothing on the page is touched.

// ---------- Helpers (already done) ----------

function minutesBetween(from, to) {
  return Math.round((to - from) / 60000);
}

export function minutesUntil(departure, now) {
  return minutesBetween(now, new Date(departure.expected));
}

export function delayMinutes(departure) {
  return minutesBetween(new Date(departure.scheduled), new Date(departure.expected));
}

export function isCancelled(departure) {
  return departure.state === "CANCELLED";
}

// ---------- Step 1 – map ----------
// TODO: toRow(departure, now) turns one raw departure into the row the board
// needs: { id, line, mode, group, destination, display, minutes, delay, cancelled }

// ---------- Step 2 – filter ----------
// TODO: byMode(mode), within(maxMinutes), notCancelled

// ---------- Step 3 – chain ----------
// TODO: visibleRows(rows, filters) – filter, filter, filter, toSorted

// ---------- Step 4 – reduce ----------
// TODO: countByMode(rows), countCancelled(rows)

// ---------- Breakout ----------
// TODO: nextPerLine(rows) – the next departure for every line
