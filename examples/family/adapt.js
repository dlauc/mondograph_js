// Turn examples/ui_sample_network.json (gdict-style src/predicate/dst) into
// mondograph data the way the Name Family Explorer will: predicates map to
// display families F1–F9, F1 (same name, other script) becomes chips on the
// node instead of edges, and language families become hulls.
// The provenance / status / certainty values are illustrative only.

export const FAMILY_OF = {
  'transliteration-of': 'F1',
  'interlingual-equivalent-of': 'F2', 'phonetic-loan-of': 'F2', 'language-form-of': 'F2', 'religious-name-of': 'F2',
  'cognate-of': 'F3',
  'translation-of': 'F4', 'meaning': 'F4',
  'hypocorism-of': 'F5', 'nickname-of': 'F5', 'contracted-from': 'F5', 'augmentative-of': 'F5',
  'masculine-of': 'F6', 'feminine-of': 'F6', 'opposite-gender-of': 'F6',
  'variant-of': 'F7',
  'derived-from': 'F8', 'borrowed-from': 'F8', 'compound-of': 'F8', 'contains-element': 'F8', 'patronymic-of': 'F8',
  // kept out of the family view (plan §4.2)
  'named-after': null,
};

export const FAMILY_LABEL = {
  F1: 'Other spelling or script', F2: 'Same name, other language', F3: 'Same origin', F4: 'Same meaning',
  F5: 'Short and pet forms', F6: 'Gender counterpart', F7: 'Variant', F8: 'Lineage', F9: 'Sounds alike',
};

const WORDING = {
  'interlingual-equivalent-of': 'used as the same name as', 'phonetic-loan-of': 'borrowed by sound from',
  'cognate-of': 'shares an origin with', 'translation-of': 'means the same as', 'meaning': 'means',
  'hypocorism-of': 'short form of', 'nickname-of': 'nickname for', 'contracted-from': 'contracted from',
  'augmentative-of': 'augmentative of', 'feminine-of': 'feminine of', 'masculine-of': 'masculine of',
  'opposite-gender-of': 'gender counterpart of', 'variant-of': 'variant of', 'derived-from': 'derived from',
  'borrowed-from': 'borrowed from', 'compound-of': 'built from', 'contains-element': 'contains', 'patronymic-of': 'patronymic of',
  'religious-name-of': 'religious name of',
};

// direction mapping for the lineage view: ancestor above (plan §4.5)
const ANCESTOR_IS_OBJECT = new Set(['derived-from', 'borrowed-from', 'compound-of', 'contains-element', 'patronymic-of']);

const LANG_GROUP = {
  hrv: 'Slavic', srp: 'Slavic', bos: 'Slavic', bul: 'Slavic', mkd: 'Slavic', slk: 'Slavic', pol: 'Slavic', ces: 'Slavic', rus: 'Slavic', 'sla-pro': 'Slavic',
  deu: 'Germanic', eng: 'Germanic', goh: 'Germanic', 'gem-pro': 'Germanic',
  ita: 'Romance', fra: 'Romance', lat: 'Romance',
  ara: 'Semitic', tur: 'Turkic', jpn: 'Japonic', wol: 'Atlantic', swa: 'Bantu',
};

function popularityOf(n) {
  const p = n.attrs?.popularity;
  if (!p) return 0.35;
  const b = Object.values(p).reduce((s, x) => s + (x.bearers ?? 0), 0);
  return Math.max(0.15, Math.min(1, Math.log10(b + 1) / 6.5));
}

export function adapt(raw) {
  const label = (n) => n.form ?? n.attrs?.label_en ?? n.id;
  const nodes = raw.nodes.map(n => ({
    id: n.id, label: label(n), lang: n.lang, script: n.script, ipa: n.ipa,
    type: n.type === 'form' ? 'given' : n.type,
    gender: n.attrs?.gender ? n.attrs.gender.toUpperCase() : undefined,
    popularity: popularityOf(n), chips: [], raw: n,
  }));
  const byId = new Map(nodes.map(n => [n.id, n]));
  const edges = [];
  const chipOnly = new Set();
  raw.edges.forEach((e, i) => {
    const fam = FAMILY_OF[e.predicate];
    if (fam === null || fam === undefined) return;
    const assertionId = `as-${i}`;
    if (fam === 'F1') {
      // chip on the object; the subject spelling is a chip, not a node
      const host = byId.get(e.dst), form = byId.get(e.src);
      if (host && form) {
        host.chips.push({ id: `chip-${i}`, label: form.label, assertionId, status: i % 7 === 3 ? 'disputed' : 'open', script: form.script });
        chipOnly.add(form.id);
      }
      return;
    }
    const conf = e.attrs?.confidence;
    const provenance = conf != null && conf < 0.6 ? 'modelled' : (i % 11 === 5 ? 'community' : (i % 13 === 7 ? 'unknown' : 'recorded'));
    const lineage = ANCESTOR_IS_OBJECT.has(e.predicate);
    edges.push({
      id: assertionId, assertionId, predicate: e.predicate, family: fam,
      from: lineage ? e.dst : e.src, to: lineage ? e.src : e.dst,
      directed: fam === 'F5' || lineage,
      provenance,
      certainty: conf != null && conf < 0.5 ? 'uncertain' : 'some',
      status: i % 17 === 9 ? 'disputed' : (i % 23 === 11 ? 'suppressed' : 'open'),
      label: `${byId.get(e.src)?.label ?? e.src} — ${WORDING[e.predicate] ?? e.predicate} — ${byId.get(e.dst)?.label ?? e.dst}`,
    });
  });
  // nodes that only exist as chips leave the graph (unless something else links them)
  const linked = new Set(edges.flatMap(e => [e.from, e.to]));
  const keptNodes = nodes.filter(n => !chipOnly.has(n.id) || linked.has(n.id));
  const groups = new Map();
  for (const n of keptNodes) {
    const g = LANG_GROUP[n.lang];
    if (!g) continue;
    if (!groups.has(g)) groups.set(g, { id: g, label: g, members: [] });
    groups.get(g).members.push(n.id);
  }
  return { nodes: keptNodes, edges, groups: [...groups.values()].filter(g => g.members.length > 1) };
}

/** The k-hop neighbourhood of `id` (what an endpoint would return). */
export function neighbourhood(data, id, hops = 2, filterEdge = () => true) {
  const keep = new Set([id]);
  let frontier = [id];
  const edges = data.edges.filter(filterEdge);
  for (let h = 0; h < hops; h++) {
    const next = [];
    for (const e of edges) {
      for (const [a, b] of [[e.from, e.to], [e.to, e.from]]) {
        if (frontier.includes(a) && !keep.has(b)) { keep.add(b); next.push(b); }
      }
    }
    frontier = next;
  }
  return {
    nodes: data.nodes.filter(n => keep.has(n.id)),
    edges: edges.filter(e => keep.has(e.from) && keep.has(e.to)),
    groups: data.groups.map(g => ({ ...g, members: g.members.filter(m => keep.has(m)) })).filter(g => g.members.length > 1),
  };
}
