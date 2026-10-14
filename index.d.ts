// Type declarations for mondograph 0.2.1 (hand-written; keep in step with src/).

// ── Data schemas ────────────────────────────────────────────────────────────

export type Provenance = 'recorded' | 'modelled' | 'modeled' | 'community' | 'unknown';
export type LinkStatus = 'open' | 'disputed' | 'suppressed' | 'excluded';
export type Certainty = 'firm' | 'some' | 'uncertain';

/** A pill drawn around a node (e.g. an F1 same-name spelling). */
export interface GraphChip {
  id: string;
  label: string;
  /** The assertion the chip stands for; passed back untouched in onChipSelect. */
  assertionId?: string;
  /** 'disputed' draws struck through; 'suppressed' / 'excluded' hide unless showSuppressed. */
  status?: LinkStatus;
  [key: string]: unknown;
}

/** The synthetic chip that stands for chips past `maxChips`. */
export interface OverflowChip {
  id: '+more';
  label: string;          // "+k"
  overflow: true;
  count: number;
  hidden: GraphChip[];
}

export interface GraphNode {
  id: string;
  /** Display text (falls back to `form`, then `id`). */
  label?: string;
  form?: string;
  /** Drawing style: 'given' | 'surname' | 'text' | 'form' | 'etymon' | 'flag' | 'image' |
   *  'concept' | 'referent' | 'element' | 'attestation' | 'stub' (anything else draws as text). */
  type?: string;
  lang?: string;
  /** 'M' | 'F' | 'U' tints the ring (themes' genderColors). */
  gender?: string;
  /** 0..1, scales the disc and label. Default 0.5. */
  popularity?: number;
  /** Label/collapse priority (falls back to popularity). */
  importance?: number;
  ipa?: string;
  /** sectors: the sector this node belongs to (overrides edge-derived family). */
  family?: string;
  /** sectors: ring 1..maxRing (overrides hop distance). */
  ring?: number;
  /** similarity: 0..1, nearer the centre when higher. */
  score?: number;
  /** rings: year; old forms are pushed outward. */
  period?: number;
  chips?: GraphChip[];
  flags?: string[];
  countries?: string[];
  countriesData?: Record<string, { bearers?: number }>;
  imageUrl?: string;
  iso2?: string;
  [key: string]: unknown;
}

/** Stand-in for collapsed nodes of a sector (sectors layout, past maxPerSector). */
export interface StubNode extends GraphNode {
  id: `more:${string}`;
  type: 'stub';
  family: string;
  count: number;
  /** ids of the collapsed nodes. */
  members: string[];
  label: string;           // "+N"
  ring: number;
}

export interface GraphEdge {
  /** Stable id. Defaults to `assertionId`, else `${from}|${type ?? family ?? ''}|${to}` (duplicates get `#n`). */
  id?: string;
  from: string;
  to: string;
  /** gdict-style aliases are accepted on input: src / dst / predicate. */
  src?: string;
  dst?: string;
  predicate?: string;
  /** Legacy style key (theme.edgeTypes). */
  type?: string;
  /** Display family (theme.edgeFamilies / --mg-edge-<family>): colour and sector. */
  family?: string;
  /** recorded: solid · modelled: dashed · community: solid + mark · unknown: dotted. */
  provenance?: Provenance;
  /** disputed: strike mark · suppressed/excluded: hidden unless showSuppressed. */
  status?: LinkStatus;
  /** 'uncertain' draws a "?" glyph at the midpoint. */
  certainty?: Certainty;
  /** true draws an arrow from → to (layered: from is the upper layer). */
  directed?: boolean;
  /** Shown on hover / selection / keyboard focus. */
  label?: string;
  assertionId?: string;
  /** similarity layout: score of the edge to the centre. */
  score?: number;
  weight?: number;
  [key: string]: unknown;
}

export interface GraphGroup {
  id: string;
  members: string[];
  label?: string;
  /** Hull colour (default theme.hullColor / --mg-hull). */
  color?: string;
  /** Hull padding around member discs, px (default 12). */
  padding?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups?: GraphGroup[];
}

/** Normalised edge as the library hands it back (id/from/to always set). */
export type ResolvedEdge = GraphEdge & { id: string; from: string; to: string };

// ── Layouts ────────────────────────────────────────────────────────────────

export interface LayoutContext {
  W: number;
  H: number;
  centerId: string | null;
  [key: string]: unknown;
}

export type Positions = Map<string, { x: number; y: number }>;
export type LayoutFn = (graph: { nodes: GraphNode[]; edges: ResolvedEdge[]; groups?: GraphGroup[] }, opts: LayoutContext) => Positions;

export interface SectorsOptions {
  /** Families in angular order (clockwise from 12 o'clock); others follow by first appearance. */
  sectorOrder?: string[];
  /** Nodes per sector before the rest collapse into a stub. Default: no limit. */
  maxPerSector?: number;
  /** Minimum arc length between neighbours on a ring before they stagger radially (px). Default 64. */
  minLabelGap?: number;
  /** Gap between sectors (radians). Default 0.08. */
  sectorGap?: number;
  /** Minimum sector width (radians). Default π/18. */
  minSectorAngle?: number;
  startAngle?: number;
  /** Rings used (hop distance is capped here). Default 3. */
  maxRing?: number;
  /** Radial rows a crowded ring may use. Default 3. */
  maxRows?: number;
  rowStep?: number;
  margin?: number;
  familyOf?: (node: GraphNode) => string | null | undefined;
  ringRadius?: (ring: number, R: number, maxRingUsed: number) => number;
}
export interface SectorsResult extends Positions {
  stubs: StubNode[];
  collapsed: Map<string, string>;
  family: Map<string, string>;
  sectors: Array<{ family: string; start: number; end: number; count: number; collapsed: number }>;
}

export interface LayeredOptions {
  /** Which edges constrain layering. Default: edge.directed === true. */
  isDirected?: (edge: ResolvedEdge) => boolean;
  sweeps?: number;
  layerGap?: number;
  nodeGap?: number;
  margin?: number;
  direction?: 'TB' | 'LR';
  /** Optional async layout (e.g. lazily imported elkjs). Its positions replace the built-in ones when it resolves. */
  layoutAdapter?: (graph: { nodes: GraphNode[]; edges: ResolvedEdge[] }, opts: LayoutContext) => Promise<Positions | Record<string, { x: number; y: number }>>;
}
export interface LayeredResult extends Positions {
  layers: Map<string, number>;
  /** Directed edges that closed a cycle; drawn without arrows. */
  backEdges: Set<string>;
}

export interface SimilarityOptions {
  scoreOf?: (node: GraphNode) => number | null | undefined;
  /** Radius of score 1. Default max(56, 0.18 R). */
  minRadius?: number;
  margin?: number;
  startAngle?: number;
}
export interface SimilarityResult extends Positions {
  radius: Map<string, number>;
  score: Map<string, number>;
}

export function rings(graph: Parameters<LayoutFn>[0], opts: LayoutContext): Positions;
export function sectors(graph: Parameters<LayoutFn>[0], opts: LayoutContext & SectorsOptions): SectorsResult;
export function layered(graph: Parameters<LayoutFn>[0], opts: LayoutContext & LayeredOptions): LayeredResult;
export function similarity(graph: Parameters<LayoutFn>[0], opts: LayoutContext & SimilarityOptions): SimilarityResult;
export function placeAround(anchor: { x: number; y: number }, center: { x: number; y: number }, ids: string[],
  opts?: { radius?: number; spacing?: number; spread?: number }): Positions;
export const layouts: Record<'rings' | 'sectors' | 'layered' | 'similarity' | string, LayoutFn>;
export function registerLayout(name: string, fn: LayoutFn): void;

export type LayoutName = 'rings' | 'sectors' | 'layered' | 'similarity';

// ── Options & callbacks ──────────────────────────────────────────────────────

export interface DescribeContext {
  isCenter?: boolean;
  /** The edge from the anchor (the node whose neighbours are being walked) to this node. */
  edge?: ResolvedEdge;
  anchor?: GraphNode;
  /** 1-based position among the anchor's neighbours, and their count. */
  index?: number;
  total?: number;
  describeEdge?: (edge: ResolvedEdge, ctx: DescribeContext) => string;
}

export interface PerfOptions {
  /** Cap on devicePixelRatio. Default 2. */
  maxDpr?: number;
  /** Above this node count, drop shadows are skipped. Default 80. */
  shadowMaxNodes?: number;
  /** Below this zoom only the centre keeps its label. Default 0.5. */
  labelMinScale?: number;
  /** Below this zoom chips are not drawn. Default 0.7. */
  chipMinScale?: number;
  /** Hulls are recomputed only when a member moves this far (px). Default 4. */
  hullQuantum?: number;
  /** Idle redraw interval (ms). Default 250. */
  idleRedrawMs?: number;
  /** Above this node count the theme's resting float is off. Default 80. */
  floatMaxNodes?: number;
  /** Draw a settled scene once to an offscreen layer and blit it while panning/hovering. Default true. */
  layerCache?: boolean;
  /** Layer budget in multiples of the on-screen canvas area. Default 3. */
  layerMaxPixels?: number;
  /** While a scene larger than lodMinNodes animates: no chips, sub-labels or edge marks, dashes solid. Default true. */
  motionLOD?: boolean;
  lodMinNodes?: number;
}

export interface MondoGraphOptions {
  container: string | HTMLElement;
  /** Optional fetcher: setCenter(id) awaits it and replaces the scene. Without it, use setData/addNeighbors. */
  getNeighbors?: (id: string) => Promise<GraphData>;
  /** Initial data (equivalent to calling setData(data, centerId)). */
  data?: GraphData;
  centerId?: string;

  layout?: LayoutName | LayoutFn;
  layoutOptions?: SectorsOptions & LayeredOptions & SimilarityOptions & Record<string, unknown>;
  /** 'mondonomo' (dark) | 'editorialLight', or a partial theme object. `--mg-*` CSS tokens override it. */
  theme?: string | Record<string, unknown>;
  /** Read `--mg-*` custom properties from the container. Default true. */
  cssTokens?: boolean;

  /** Draw suppressed/excluded edges and chips (faint). Default false. */
  showSuppressed?: boolean;
  /** Which nodes draw their chips. Default 'all'. */
  chipsFor?: 'all' | 'focus' | 'none';
  /** Chips drawn per node before the "+k" overflow chip. Default 4. */
  maxChips?: number;
  /** 'auto' (default) moves a label that does not fit beside its disc; 'inside'
   *  keeps every label in its own disc, shrinking the font to 70% and then
   *  truncating with "…" (the full name stays in the tooltip and the mirror). */
  labels?: 'auto' | 'inside';
  /** Draw only the centre's edges, and those of the hovered / keyboard-focused
   *  node or the selected edge, at full strength; the rest at this alpha
   *  (true = 0.12). Default false. */
  edgeFocus?: boolean | number;

  /** Fired after every re-centre (and when the centre is clicked again) with the centre node. */
  onSelect?: (node: GraphNode) => void;
  onCenterChange?: (id: string, info: { reason: 'click' | 'keyboard' | 'back' | 'api' | 'data' | string; canGoBack: boolean }) => void;
  /** An edge was clicked / activated from the keyboard; null when a click on empty canvas cleared the selection. */
  onEdgeSelect?: (edge: ResolvedEdge | null) => void;
  /** A chip was clicked / activated (chip may be the OverflowChip). */
  onChipSelect?: (node: GraphNode, chip: GraphChip | OverflowChip) => void;
  /** A "+N more" stub was clicked. Default behaviour (when omitted): expandStub(stub.id, 20). */
  onStubSelect?: (stub: StubNode) => void;
  onError?: (err: unknown) => void;
  /** Per drawn frame (benchmarks). */
  onFrame?: (info: { drawMs: number; nodes: number; edges: number }) => void;

  renderTooltip?: (node: GraphNode) => string;
  renderEdgeTooltip?: (edge: ResolvedEdge) => string;
  renderChipTooltip?: (node: GraphNode, chip: GraphChip | OverflowChip) => string;

  /** Build the keyboard/screen-reader DOM mirror. Default true. */
  a11y?: boolean;
  ariaLabel?: string;
  ariaRoleDescription?: string;
  describeNode?: (node: GraphNode, ctx: DescribeContext) => string;
  describeEdge?: (edge: ResolvedEdge, ctx: DescribeContext) => string;
  /** id of the caller's drawer; edge/chip mirror buttons get aria-haspopup="dialog" aria-controls. */
  drawerId?: string;
  /** 'auto' follows prefers-reduced-motion (default); true/false forces it. */
  reducedMotion?: 'auto' | boolean;
  /** Placement of nodes added by addNeighbors. */
  addNeighborsPlacement?: { radius?: number; spacing?: number; spread?: number };
  perf?: PerfOptions;
}

export type Pick =
  | { kind: 'chip'; nodeId: string; chip: GraphChip | OverflowChip }
  | { kind: 'node'; id: string }
  | { kind: 'edge'; id: string }
  | null;

export type FilterFn = (item: GraphNode | ResolvedEdge, kind: 'node' | 'edge') => boolean;

// ── The graph ───────────────────────────────────────────────────────────────

export class MondoGraph {
  constructor(options: MondoGraphOptions);

  /** Re-centre (pushes history unless push:false). Fetches through getNeighbors when given. */
  setCenter(id: string, opts?: { push?: boolean; reason?: string }): Promise<void>;
  /** Replace the graph and centre on centerId (pushes history when the centre changes). */
  setData(data: GraphData, centerId?: string, opts?: { push?: boolean; reason?: string }): void;
  /** Merge nodes/edges/groups beside an anchor without re-centring. */
  addNeighbors(anchorId: string, data: Partial<GraphData>): void;
  setLayout(name: LayoutName | LayoutFn | string, opts?: SectorsOptions & LayeredOptions & SimilarityOptions & Record<string, unknown>): void;
  /** Reveal `by` more nodes from a sectors stub. */
  expandStub(stubId: string, by?: number): boolean;
  /** Fade non-matching nodes/edges in place (null clears). The centre never fades. */
  setFilter(fn: FilterFn | { node?: (n: GraphNode) => boolean; edge?: (e: ResolvedEdge) => boolean } | null): void;
  /** Emphasise node and/or edge ids (others dim); null clears. */
  highlight(ids: Iterable<string> | null): void;
  /** Select an edge (null clears). Does not fire onEdgeSelect. */
  selectEdge(id: string | null): void;
  readonly selectedEdge: ResolvedEdge | null;
  /** Pop history and re-centre there; false when empty. */
  back(): boolean;
  readonly canGoBack: boolean;
  readonly history: string[];
  readonly centerId: string | null;
  setShowSuppressed(on: boolean): void;
  getScene(): { nodes: Array<GraphNode | StubNode>; edges: ResolvedEdge[]; groups: GraphGroup[]; centerId: string | null };
  positionOf(id: string): { x: number; y: number } | null;
  /** Hit-test a canvas-relative screen point. */
  pick(x: number, y: number): Pick;

  setTheme(theme: string | Record<string, unknown>): void;
  /** Re-read `--mg-*` tokens (call after toggling dark mode). */
  refreshTheme(): void;
  readonly theme: Record<string, unknown>;
  resetView(): void;
  panBy(dx: number, dy: number): void;
  zoomTo(scale: number, screenX?: number, screenY?: number): void;
  readonly view: { panX: number; panY: number; scale: number };

  toSVG(opts?: { fit?: boolean; margin?: number }): string;
  toPNG(scale?: number): Promise<Blob | string>;

  /** Move keyboard focus to a node's mirror button (default: the focused node / centre). */
  focus(id?: string): boolean;
  /** Move keyboard focus to an edge's mirror button (e.g. when the caller's drawer closes). */
  focusEdge(id: string): boolean;

  readonly renderer: unknown;
  destroy(): void;
}

/** @deprecated The package is now `mondograph`; kept for one version. */
export const ThinkGraph: typeof MondoGraph;
export type ThinkGraph = MondoGraph;
export default MondoGraph;

export const VERSION: string;

// ── Utilities (pure) ────────────────────────────────────────────────────────

export function resolveTheme(input?: string | Record<string, unknown> | null): Record<string, any>;
export function readThemeTokens(getVar: (name: string) => string, keys?: { families?: Iterable<string>; langs?: Iterable<string> }): Record<string, any>;
export function hitTest(px: number, py: number, nodes: Array<{ id: string; x: number; y: number; hitRadius: number }>): string | null;
export function hitRadius(node: GraphNode | string, isCenter: boolean, isTouch: boolean): number;
export function visualRadius(node: GraphNode, isCenter: boolean): number;
export function pointSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number;
export interface EdgeGeometry { x1: number; y1: number; x2: number; y2: number; mx: number; my: number; ux: number; uy: number; edge: ResolvedEdge }
export function computeEdgeGeometry(edges: ResolvedEdge[], nodeState: Map<string, { x: number; y: number; visualRadius?: number }>, hasArrow?: (e: ResolvedEdge) => boolean): Map<string, EdgeGeometry>;
export function hitTestEdges(px: number, py: number, geometry: Map<string, { x1: number; y1: number; x2: number; y2: number }> | Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>, tolerance?: number, accept?: (id: string) => boolean): string | null;
export function resolveEdgeStyle(edge: GraphEdge, theme: Record<string, any>, state?: { showSuppressed?: boolean; backEdges?: Set<string> }): {
  stroke: string; width: number; dash: number[]; arrow: boolean; animate: boolean; mark: 'community' | null;
  strike: boolean; uncertain: boolean; hidden: boolean; alpha: number;
};
export interface ChipBox { chip: GraphChip | OverflowChip; x: number; y: number; w: number; h: number }
export function layoutChips(chips: GraphChip[], x: number, y: number, r: number, opts: { max?: number; measure: (text: string) => number; showSuppressed?: boolean; rowWidth?: number; gap?: number; padX?: number }): ChipBox[];
export function hitTestChips(px: number, py: number, boxes: Array<ChipBox & { nodeId: string }>, pad?: number): { nodeId: string; chip: GraphChip | OverflowChip } | null;
export interface LabelItem { id: string; x: number; y: number; r: number; text: string; size: number; priority?: number; fixed?: boolean; insideY?: number; fitW?: number }
export interface LabelPlacement { text: string; dx: number; dy: number; inside: boolean; truncated: boolean; hidden: boolean; box: { x0: number; y0: number; x1: number; y1: number } | null; size?: number }
export function placeLabels(items: LabelItem[], opts: { measure: (text: string, size: number) => number; obstacles?: Array<{ x0: number; y0: number; x1: number; y1: number; owner?: string }>; pad?: number; insideOnly?: boolean; minScale?: number }): Map<string, LabelPlacement>;
export function truncateToWidth(text: string, maxW: number, measure: (s: string) => number): string;
export function convexHull(points: Array<[number, number]>): Array<[number, number]>;
export function hullPolygon(circles: Array<{ x: number; y: number; r: number }>, pad?: number, samples?: number): Array<[number, number]>;
export function sceneToSVG(scene: Record<string, any>): string;
export function defaultDescribeNode(node: GraphNode, ctx?: DescribeContext): string;
export function defaultDescribeEdge(edge: ResolvedEdge, ctx?: DescribeContext): string;
export function hashString(str: string): number;
export function jitter(id: string, amp: number): { dx: number; dy: number };

/** Preload flag assets for the given ISO-2 codes (parallel, local assets). */
export function preloadFlags(isoCodes: string[]): Promise<void>;
/** Point the flag store at a different asset base path (must end in '/'). */
export function configureFlagBase(path: string): void;
/** Clear the flag image cache. */
export function clearFlagCache(): void;
