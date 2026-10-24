# SL-tavlan 🚇

En avgångstavla för T-Centralen, byggd med vanlig JavaScript. Vi använder den i två pass:

1. **Higher-order functions** (tisdag 27 okt) – `map`, `filter`, `reduce`, `find`/`some` och `toSorted` på riktig trafikdata.
2. **Animationer för feedback** (onsdag 28 okt) – samma tavla får laddning, uppdateringar, förseningar, störningar och fel som syns.

## Idén

**En app, två pass.** Du behöver inte lära dig ett nytt projekt till onsdag. Tavlan du bygger på tisdagen är den vi ger feedback och animationer på onsdagen.

**Varför en avgångstavla?** Den har mycket riktig data, över hundra avgångar med linjer, tider, förseningar och inställda turer. Det är precis vad `map`, `filter` och `reduce` är till för. Den ändras också hela tiden, så animationer har en uppgift: de visar *vad som är nytt* och *vad som gick fel*, inte bara att något är snyggt.

**Varje steg är en branch.** Projektet är exemplet från föreläsningen och en övning du gör i din egen takt. Varje steg finns färdigt som en egen branch, så du kan jämföra med din kod eller hoppa till ett steg (se [Checkpoints](#checkpoints)). `main` är startpunkten.

**Den här filen växer.** Längst ner, under [Steg för steg](#steg-för-steg), finns ett avsnitt för varje steg vi har gjort: *vad* vi gjorde, *varför*, och hur du *provar* det. På varje ny branch har det kommit till ett avsnitt till, och en ruta med vad nästa steg går ut på. Byt branch och läs vidare där du slutade.

**Koden har en tydlig ordning.** Data hämtas i `api.js`. Den görs om i `departures.js`, med funktioner som bara tar data och lämnar tillbaka ny data. Den ritas i `render.js`. `main.js` kopplar ihop allt. I pass 2 är tanken: JavaScript bestämmer *vilket läge* något är i, och CSS bestämmer *hur det läget ser ut*.

**Du ska kunna förklara varje rad.** Använd gärna AI, men om du inte kan säga varför en rad står där är den inte din än. Läs "Varför" i varje steg, och jämför stegen med `git diff` (se nedan).

## Kom igång

```bash
npm start
```

Öppna adressen som skrivs ut (oftast http://localhost:3000).

Du kan också använda **Live Server** i VS Code. Öppna `index.html` och klicka på "Go Live".

> Varför behövs en server? Filerna använder ES-moduler (`import`/`export`), och de fungerar inte om du öppnar `index.html` direkt från disken (`file://`).

## Datakällor

Välj källa med en parameter i adressfältet:

| Adress | Vad händer |
|---|---|
| `/` eller `?source=snapshot` | Sparad data från `data/departures-1002.json` (standard) |
| `?source=live` | Riktig data direkt från SL |
| `?source=broken` | Hämtar en fil som inte finns, för att testa felhantering |
| `?latency=1500` | Låtsas att nätet är långsamt (pass 2) |

Datan kommer från [SL Transport API](https://www.trafiklab.se/api/trafiklab-apis/sl/transport/) via Trafiklab. Det behövs ingen API-nyckel, men gör inte fler anrop än du behöver.

## Filer

```
index.html            Tavlans HTML
styles.css            Utseende (och animationer i pass 2)
src/
  main.js             Startar appen och kopplar ihop allt
  api.js              Hämtar data: live eller sparad
  departures.js       Pass 1: alla higher-order functions bor här
  render.js           Gör om data till HTML
  feedback.js         Pass 2: hjälpfunktioner för feedback (finns från l2-1-button)
data/
  departures-1002.json  Sparad data för T-Centralen
scripts/
  fetch-snapshot.js   Sparar ny data från SL
```

## Checkpoints

Varje steg finns som en egen branch. Fastnat, eller vill du se hur det blev? Spara det du har och byt branch:

```bash
git stash                 # lägger undan dina ändringar (hämta dem med git stash pop)
git switch l1-2-filter
```

Vill du se exakt vad ett steg lade till? Jämför två branches:

```bash
git diff l1-1-map l1-2-filter
```

| Branch | Steg |
|---|---|
| `l1-0-start` | Pass 1 börjar: utforska datan i konsolen |
| `l1-1-map` | `map`: avgångar blir rader på tavlan |
| `l1-2-filter` | `filter`: trafikslag, inom 10 min, dölj inställda |
| `l1-3-chain` | Kedja: `filter` → `toSorted` |
| `l1-4-reduce` | `reduce`: antal per trafikslag, inställda, `some` |
| `l1-5-done` | Breakout-lösning: nästa avgång per linje |
| `l2-0-start` | Pass 2 börjar (samma som `l1-5-done`) |
| `l2-1-button` | Uppdatera-knappen: tryck, laddar, klart, fel |
| `l2-2-rows` | Nya rader vänds in som på en gammal tavla |
| `l2-3-status` | "Nu" pulserar, försening blinkar, inställd stryks |
| `l2-4-deviations` | Störningar glider in och läses upp |
| `l2-5-error` | Fel: skak, gråad tavla, ärligt meddelande |
| `l2-6-done` | Breakout-lösning: rader animeras när filtret ändras |

`main` är samma som `l1-0-start`, och `solution` är samma som `l2-6-done`.

## Ny riktig data

```bash
npm run snapshot          # T-Centralen
npm run snapshot -- 9117  # en annan station (site-id)
```

Kör gärna i rusningstid, runt 08:00 eller 17:00, så blir tavlan full.

Datan som följer med är **exempeldata** i samma format som SL:s API, så att allt fungerar även utan nät.

## Steg för steg

Du är på branchen **`l1-2-filter`**. Kolla med `git branch --show-current`.

### Pass 1, steg 0 – Titta på datan först · `l1-0-start`

**Vad vi gör:** Tavlan hämtar data men visar inga avgångar än. Öppna DevTools → Console och utforska:

```js
board.departures.length
board.departures[0]
board.departures[0].line
board.deviations
```

**Varför:** Innan vi gör om data måste vi veta hur den ser ut. En avgång från SL är ett stort, nästlat objekt. Tavlan behöver bara en del av det: linje, destination, tid, och om turen är försenad eller inställd. Fråga dig: *vilka fält behöver jag, och var ligger de?*

**Var i koden:** `src/main.js` lägger datan i `window.board` så att du når den i konsolen. I `src/departures.js` och `src/render.js` står det `TODO` där vi ska skriva kod.

### Pass 1, steg 1 – `map`: avgångar blir rader · `l1-1-map`

**Vad vi gör:** `toRow(departure, now)` i `src/departures.js` gör om en rå avgång till en platt rad. `renderRows` i `src/render.js` gör om varje rad till en `<li>`. I `src/main.js` blir alla avgångar rader:

```js
state.rows = board.departures.map((departure) => toRow(departure, board.now));
```

**Varför:**
- `map` ger *lika många* saker tillbaka som du stoppar in. 104 avgångar blir 104 rader, och originalet är orört.
- `toRow` är det enda stället som känner till SL:s format. Byter SL namn på ett fält rättar du det på ett ställe, och resten av appen märker inget.
- Varför inte `board.departures.map(toRow)`? `map` skickar med tre saker till funktionen: elementet, indexet och hela arrayen. Då skulle `now` bli indexet (0, 1, 2 …). Med en arrow function bestämmer vi själva vad som skickas.

**Prova:** Tavlan visar nu alla avgångar. Räkna: är det lika många rader som `board.departures.length`?

### Pass 1, steg 2 – `filter`: välj vad som syns · `l1-2-filter`

**Vad vi gör:** Tre filter i `src/departures.js`:

```js
export function byMode(mode) {
  return (row) => row.mode === mode;
}
```

`within(maxMinutes)` fungerar på samma sätt, och `notCancelled(row)` svarar `true` om turen går. `render()` i `src/main.js` läser formuläret och filtrerar bara när ett filter är valt.

**Varför:**
- `filter` ger *färre eller lika många* tillbaka, aldrig fler. Raderna själva ändras inte.
- `byMode("METRO")` är en funktion som *gör* en funktion. Den nya funktionen minns `mode` (en closure), och det är precis en sådan funktion `filter` vill ha.
- Fallgrop: `rows.filter(byMode)` utan anrop. Då får `filter` funktionen som gör funktioner, och varje svar blir en funktion. En funktion räknas som sant, så alla rader blir kvar.

**Prova:** Klicka på Tunnelbana, Inom 10 min och Dölj inställda. Statusraden visar hur många av alla som syns.

### Nästa steg

**Steg 3 – kedjan.** Flytta filtreringen från `main.js` till en egen funktion och sortera resultatet.

- I `src/departures.js`: skriv `byTime(a, b)` som jämför `minutes`, och `visibleRows(rows, filters)` som kör de valda filtren efter varandra och till sist `toSorted(byTime)`.
- `render()` i `main.js` anropar bara `visibleRows(state.rows, readFilters())`.
- Använd `toSorted`, inte `sort`. Fundera på varför innan du läser svaret.

Klar eller fast? `git switch l1-3-chain`
