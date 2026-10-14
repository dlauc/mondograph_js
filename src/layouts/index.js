import { rings }      from './rings.js';
import { sectors }    from './sectors.js';
import { layered }    from './layered.js';
import { similarity } from './similarity.js';

/** Built-in layout plug-ins: `(graph, {W,H,centerId,...}) → Map<id,{x,y}>`. */
export const layouts = { rings, sectors, layered, similarity };

/** Register a custom layout under `name` (it becomes usable in setLayout). */
export function registerLayout(name, fn) {
  if (typeof fn !== 'function') throw new TypeError('layout must be a function');
  layouts[name] = fn;
}

export { rings, sectors, layered, similarity };
export { placeAround } from './place.js';
