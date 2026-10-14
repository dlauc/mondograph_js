import { computeTargets } from '../layout.js';

/**
 * The original ThinkGraph layout: BFS rings (hop distance, capped at 3) with
 * nodes spread evenly on each ring; `node.period` pushes old forms outward.
 * @param {{nodes:object[], edges:object[]}} graph
 * @param {{W:number, H:number, centerId:string}} opts
 * @returns {Map<string,{x:number,y:number}>}
 */
export function rings(graph, opts) {
  return computeTargets(opts.centerId, graph.nodes, graph.edges, opts.W, opts.H);
}
