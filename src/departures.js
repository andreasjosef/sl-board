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
// reduce boils a whole array down to one value. That value can be a number…

export function countCancelled(rows) {
  return rows.reduce((count, row) => {
    if (row.cancelled) {
      return count + 1;
    }
    return count;
  }, 0);
}

// …or an object: { METRO: 60, BUS: 16, … }
// The object is brand new (the {} at the end), so it's fine to add to it.
export function countByMode(rows) {
  return rows.reduce((counts, row) => {
    if (counts[row.mode] === undefined) {
      counts[row.mode] = 0;
    }
    counts[row.mode] = counts[row.mode] + 1;
    return counts;
  }, {});
}

// some: is there at least one? Stops looking as soon as it finds one.
export function hasModeWithin(rows, mode, maxMinutes) {
  return rows.some((row) => row.mode === mode && !row.cancelled && row.minutes <= maxMinutes);
}

// ---------- Breakout ----------
// TODO: nextPerLine(rows) – the next departure for every line
