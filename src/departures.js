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
// toRow turns one raw departure into one row for the board.
// Usage: board.departures.map((departure) => toRow(departure, board.now))

export function toRow(departure, now) {
  return {
    id: departure.journey.id,
    line: departure.line.designation,
    mode: departure.line.transport_mode,
    group: departure.line.group_of_lines,
    destination: departure.destination,
    display: departure.display,
    minutes: minutesUntil(departure, now),
    delay: delayMinutes(departure),
    cancelled: isCancelled(departure),
  };
}

// ---------- Step 2 – filter ----------
// byMode and within are functions that *make* filter functions.
// Usage: rows.filter(byMode("METRO"))

export function byMode(mode) {
  return (row) => row.mode === mode;
}

export function within(maxMinutes) {
  return (row) => row.minutes <= maxMinutes;
}

export function notCancelled(row) {
  return !row.cancelled;
}

// ---------- Step 3 – chain ----------
// Each filter returns a new array, so the next step can carry on from there.
// toSorted (not sort!) leaves the original array untouched.

export function byTime(a, b) {
  return a.minutes - b.minutes;
}

export function visibleRows(rows, filters) {
  let visible = rows;
  if (filters.mode !== "ALL") {
    visible = visible.filter(byMode(filters.mode));
  }
  if (filters.soon) {
    visible = visible.filter(within(10));
  }
  if (filters.hideCancelled) {
    visible = visible.filter(notCancelled);
  }
  return visible.toSorted(byTime);
}

// ---------- Step 4 – reduce ----------
// TODO: countByMode(rows), countCancelled(rows)

// ---------- Breakout ----------
// TODO: nextPerLine(rows) – the next departure for every line
