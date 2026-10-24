// Saves a real snapshot from SL's Transport API into data/.
// Usage: node scripts/fetch-snapshot.js [siteId]   (default 1002 = T-Centralen)
// Tip: run it at rush hour (around 08:00 or 17:00) for a full, varied board.
import { writeFile } from "node:fs/promises";

const siteId = process.argv[2] ?? "1002";
const url = `https://transport.integration.sl.se/v1/sites/${siteId}/departures`;

const res = await fetch(url);
if (!res.ok) {
  console.error(`Failed: HTTP ${res.status} from ${url}`);
  process.exit(1);
}

const data = await res.json();

// The app uses taken_at as "now" when it shows a snapshot,
// so "3 min" still means 3 minutes when you open the file next week.
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const takenAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:00`;

const snapshot = {
  _meta: { taken_at: takenAt, site_id: Number(siteId), note: `Hämtad från ${url}` },
  ...data,
};

const file = `data/departures-${siteId}.json`;
await writeFile(file, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Saved ${data.departures?.length ?? 0} departures to ${file}`);
