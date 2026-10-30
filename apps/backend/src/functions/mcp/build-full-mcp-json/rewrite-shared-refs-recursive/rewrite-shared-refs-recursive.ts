const REF_PREFIX = '#/$defs/';
// Zod's registry-mode generator can emit cycle-broken schemas under
// `__shared.$defs.<id>` and reference them via `#/$defs/__shared#/$defs/<id>`
// (see zod/v4/core/to-json-schema.js). After we merge `__shared.$defs` into
// the top-level `$defs` map, those refs become pointers to a path that no
// longer exists. Rewrite them in place to the canonical `#/$defs/<id>` form.
const SHARED_REF_INFIX = '__shared#/$defs/';
export function rewriteSharedRefsRecursive(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(rewriteSharedRefsRecursive);
  }
  if (node === null || typeof node !== 'object') {
    return node;
  }
  let obj = node as Record<string, unknown>;
  let out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (
      k === '$ref' &&
      typeof v === 'string' &&
      v.startsWith(REF_PREFIX + SHARED_REF_INFIX)
    ) {
      out[k] = REF_PREFIX + v.slice((REF_PREFIX + SHARED_REF_INFIX).length);
      return;
    }
    out[k] = rewriteSharedRefsRecursive(v);
  });
  return out;
}
