#!/usr/bin/env python3
"""
Etymology example server.
Run: python3 examples/etymology/server.py
Serves GET /api/etymology/:word → { nodes, edges }
"""

import json
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import unquote

TSV_PATH = '/Users/davor/projekti/nelma/etymology/wiktionary_etymology_names.tsv'
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.normpath(os.path.join(STATIC_DIR, '..', '..', 'dist'))

# TSV row: word \t lang \t raw_python_literal_as_json_string
# raw field: JSON-encoded Python dict literal with tuple keys and list values
word_map: dict[str, list] = {}

_STEP_RE = re.compile(
    r'\(\s*\(\s*"([^"]+)"\s*,\s*(?:"([^"]*)"|(\[[^\]]*\]))\s*\)\s*,\s*'
    r'\(\s*"([^"]+)"\s*,\s*(?:"([^"]*)"|(\[[^\]]*\]))\s*\)\s*\)',
    re.DOTALL,
)


def _first_label(raw_val: str | None, list_json: str | None) -> str:
    """Return first label from string or JSON array; strip romanisation in parens."""
    if raw_val is not None:
        return raw_val.split('(')[0].strip() or raw_val
    if list_json:
        try:
            items = json.loads(list_json)
            if items:
                return str(items[0]).split('(')[0].strip()
        except Exception:
            pass
    return ''


def parse_steps(inner: str) -> list[tuple]:
    """Extract ((src_lang, src_label), (dst_lang, dst_label)) pairs via regex."""
    m = re.search(r'"inheritance":\s*\[(.+?)\]\s*[,}]', inner, re.DOTALL)
    if not m:
        return []
    results = []
    for step in _STEP_RE.finditer(m.group(1)):
        src_lang   = step.group(1)
        src_label  = _first_label(step.group(2), step.group(3))
        dst_lang   = step.group(4)
        dst_label  = _first_label(step.group(5), step.group(6))
        if src_label and dst_label:
            results.append(((src_lang, src_label), (dst_lang, dst_label)))
    return results


if os.path.exists(TSV_PATH):
    with open(TSV_PATH, encoding='utf-8') as fh:
        for line in fh:
            parts = line.rstrip('\n').split('\t', 2)
            if len(parts) < 3 or not parts[0]:
                continue
            key = parts[0].lower()
            word_map.setdefault(key, []).append((parts[1], parts[2]))
    print(f'Loaded {len(word_map)} words from TSV', flush=True)
else:
    print(f'TSV not found at {TSV_PATH} — stub data will be served', flush=True)


def build_graph(word: str) -> dict:
    entries = word_map.get(word.lower(), [])
    nodes, edges = [], []
    seen_nodes: set[str] = set()
    seen_edges: set[tuple] = set()

    center_id = f'{word}::root'
    nodes.append({'id': center_id, 'label': word, 'type': 'text', 'lang': 'English',
                  'meta': {'note': f'Etymology of "{word}"'}})
    seen_nodes.add(center_id)

    if not entries:
        for stub_lang, stub_label in [('Latin', word.capitalize()), ('Ancient Greek', word)]:
            nid = f'{stub_label}::{stub_lang}'
            nodes.append({'id': nid, 'label': stub_label, 'type': 'text', 'lang': stub_lang})
            edges.append({'from': center_id, 'to': nid, 'type': 'derives_from'})
        return {'nodes': nodes, 'edges': edges}

    for lang, raw in entries[:5]:
        try:
            inner = json.loads(raw)          # outer JSON string → Python-literal string
        except Exception:
            continue

        steps = parse_steps(inner)

        for (src_lang, src_label), (dst_lang, dst_label) in steps[:8]:
            src_id = f'{src_label}::{src_lang}'
            dst_id = f'{dst_label}::{dst_lang}'

            for nid, nlabel, nlang in [(src_id, src_label, src_lang),
                                       (dst_id, dst_label, dst_lang)]:
                if nid not in seen_nodes:
                    seen_nodes.add(nid)
                    nodes.append({'id': nid, 'label': nlabel, 'type': 'text', 'lang': nlang})

            # Connect root → source node when it matches the query word
            if src_label.lower() == word.lower():
                ek = (center_id, src_id)
                if ek not in seen_edges:
                    seen_edges.add(ek)
                    edges.append({'from': center_id, 'to': src_id, 'type': 'derives_from'})

            ek = (src_id, dst_id)
            if ek not in seen_edges:
                seen_edges.add(ek)
                edges.append({'from': src_id, 'to': dst_id, 'type': 'derives_from'})

    return {'nodes': nodes, 'edges': edges}


MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.map':  'application/json',
    '.json': 'application/json',
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        path = unquote(self.path.split('?')[0])

        if path.startswith('/api/etymology/'):
            word = path[len('/api/etymology/'):]
            result = build_graph(word)
            body = json.dumps(result).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if path == '/':
            path = '/index.html'

        if path.startswith('/dist/'):
            full = os.path.normpath(os.path.join(DIST_DIR, path[len('/dist/'):]))
        else:
            full = os.path.normpath(os.path.join(STATIC_DIR, path.lstrip('/')))

        if not os.path.isfile(full):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not found')
            return

        ext = os.path.splitext(full)[1]
        with open(full, 'rb') as fh:
            body = fh.read()
        self.send_response(200)
        self.send_header('Content-Type', MIME.get(ext, 'application/octet-stream'))
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3001
    httpd = HTTPServer(('', port), Handler)
    print(f'Etymology example: http://localhost:{port}', flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
