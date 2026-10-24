// Fetches the departures for T-Centralen: live from SL, or from a saved file.

const URLS = {
  live: "https://transport.integration.sl.se/v1/sites/1002/departures",
  snapshot: "./data/departures-1002.json",
  // A file that doesn't exist – for trying out the error state.
  broken: "./data/finns-inte.json",
};

export async function fetchBoard(source) {
  if (URLS[source] === undefined) {
    throw new Error(`Okänd källa: ${source} (välj live, snapshot eller broken)`);
  }

  const response = await fetch(URLS[source]);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.departures)) {
    throw new Error("Oväntat svar: departures saknas");
  }

  // A saved file remembers when it was taken, so "3 min" still means 3 minutes next week.
  let now = new Date();
  if (data._meta) {
    now = new Date(data._meta.taken_at);
  }

  return {
    departures: data.departures,
    deviations: data.stop_deviations || [],
    now: now,
  };
}
