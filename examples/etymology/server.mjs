// examples/etymology/server.mjs
// Run: node examples/etymology/server.mjs
// Serves GET /api/etymology/:word → { nodes, edges }
// Reads from /Users/davor/projekti/nelma/etymology/wiktionary_etymology_names.tsv

import http from 'node:http';
import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TSV_PATH = '/Users/davor/projekti/nelma/etymology/wiktionary_etymology_names.tsv';

// Parse the TSV once at startup into a Map: word → [{lang, raw}]
const wordMap = new Map();
if (fs.existsSync(TSV_PATH)) {
  for (const line of fs.readFileSync(TSV_PATH, 'utf8').split('\n')) {
    const [word, lang, raw] = line.split('\t');
    if (!word) continue;
    const key = word.toLowerCase();
    if (!wordMap.has(key)) wordMap.set(key, []);
    wordMap.get(key).push({ lang, raw });
  }
  console.log(`Loaded ${wordMap.size} words from TSV`);
} else {
  console.warn('TSV not found at', TSV_PATH, '— API will return stub data');
}

function buildGraph(word) {
  const entries = wordMap.get(word.toLowerCase()) ?? [];
  const nodes = [], edges = [], seen = new Set();

  const centerId = `${word}::root`;
  nodes.push({ id: centerId, label: word, type: 'text', lang: 'English',
               meta: { note: `Etymology of "${word}"` } });
  seen.add(centerId);

  if (entries.length === 0) {
    // Stub data for demo when TSV is missing
    const stubs = [
      { id: `${word}::Latin`, label: word.charAt(0).toUpperCase() + word.slice(1), type: 'text', lang: 'Latin' },
      { id: `${word}::Greek`, label: word,  type: 'text', lang: 'Greek' },
    ];
    for (const n of stubs) {
      nodes.push(n);
      edges.push({ from: centerId, to: n.id, type: 'derives_from' });
    }
    return { nodes, edges };
  }

  for (const { lang, raw } of entries.slice(0, 6)) {
    let parsed;
    try { parsed = JSON.parse(raw.replace(/'/g, '"')); } catch { continue; }
    for (const [, data] of Object.entries(parsed)) {
      const chain = data.inheritance ?? [];
      let prevId = centerId;
      for (const step of chain.slice(0, 4)) {
        const [stepLang, stepLabel] = Array.isArray(step) ? step : [lang, step];
        if (!stepLabel || typeof stepLabel !== 'string') continue;
        const nid = `${stepLabel}::${stepLang}`;
        if (!seen.has(nid)) {
          seen.add(nid);
          nodes.push({ id: nid, label: stepLabel, type: 'text', lang: stepLang });
        }
        if (!edges.find(e => e.from === prevId && e.to === nid)) {
          edges.push({ from: prevId, to: nid, type: 'derives_from' });
        }
        prevId = nid;
      }
    }
  }
  return { nodes, edges };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const m = req.url.match(/^\/api\/etymology\/(.+)$/);
  if (m) {
    const word = decodeURIComponent(m[1]);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(buildGraph(word)));
    return;
  }
  // Serve static files
  const __dir = path.dirname(fileURLToPath(import.meta.url));
  const file  = req.url === '/' ? '/index.html' : req.url;
  const full  = path.join(__dir, file);
  try {
    res.end(fs.readFileSync(full));
  } catch {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(3001, () => console.log('Etymology example: http://localhost:3001'));
