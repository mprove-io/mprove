import { z } from 'zod';
import { mcpToolsRegistry } from '#common/constants/mcp-tools-registry';

export interface FullMcpJsonTool {
  name: string;
  description: string;
  input: { $ref: string };
  output: { $ref: string };
}

export interface FullMcpJson {
  $schema: string;
  tools: FullMcpJsonTool[];
  $defs: Record<string, unknown>;
}

const REF_PREFIX = '#/$defs/';

// Zod's registry-mode generator can emit cycle-broken schemas under
// `__shared.$defs.<id>` and reference them via `#/$defs/__shared#/$defs/<id>`
// (see zod/v4/core/to-json-schema.js). After we merge `__shared.$defs` into
// the top-level `$defs` map, those refs become pointers to a path that no
// longer exists. Rewrite them in place to the canonical `#/$defs/<id>` form.
const SHARED_REF_INFIX = '__shared#/$defs/';

function rewriteSharedRefs(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(rewriteSharedRefs);
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
    out[k] = rewriteSharedRefs(v);
  });
  return out;
}

export function buildFullMcpJson(): FullMcpJson {
  // Build a private registry seeded with only the 12 tool input/output
  // schemas. Walking `z.globalRegistry` directly would fail with
  // "Duplicate schema id" because `zodStripCustom` (used by every DTO)
  // rebuilds nested schemas like `zBmlError` and re-applies their
  // `.meta({ id })` — leaving two distinct instances in the global registry
  // sharing the same id. Seeding our own registry from the tool I/O ensures
  // the conversion only walks the original instances reachable from MCP tools.
  let toolRegistry = z.registry();

  let tools: FullMcpJsonTool[] = mcpToolsRegistry.map(entry => {
    let inputId = z.globalRegistry.get(entry.inputSchema)?.id;
    let outputId = z.globalRegistry.get(entry.outputSchema)?.id;

    if (typeof inputId !== 'string' || typeof outputId !== 'string') {
      throw new Error(
        `MCP tool "${entry.name}" is missing a .meta({ id }) on its input or output schema`
      );
    }

    toolRegistry.add(entry.inputSchema, { id: inputId });
    toolRegistry.add(entry.outputSchema, { id: outputId });

    return {
      name: entry.name,
      description: entry.description,
      input: { $ref: `#/$defs/${inputId}` },
      output: { $ref: `#/$defs/${outputId}` }
    };
  });

  // `reused: 'inline'` keeps anonymous reused sub-schemas (primitives,
  // arrays of primitives, ad-hoc objects without `.meta({ id })`) inlined
  // at every use site instead of getting hoisted into `__shared.$defs`
  // under names like `schema15`. Only schemas with an explicit
  // `.meta({ id })` end up in `$defs`, keyed by their declared id.
  let raw = z.toJSONSchema(toolRegistry, {
    target: 'draft-2020-12',
    uri: (id: string) => `#/$defs/${id}`,
    reused: 'inline',
    unrepresentable: 'any'
  });

  let defs: Record<string, unknown> = {};

  Object.entries(raw.schemas).forEach(([id, schemaJson]) => {
    if (id === '__shared') {
      let shared = (schemaJson as Record<string, unknown>).$defs as
        | Record<string, unknown>
        | undefined;
      if (shared) {
        Object.entries(shared).forEach(([sharedId, sharedSchema]) => {
          defs[sharedId] = rewriteSharedRefs(sharedSchema);
        });
      }
      return;
    }

    let cloned = { ...(schemaJson as Record<string, unknown>) };
    delete cloned.$schema;
    delete cloned.$id;
    defs[id] = rewriteSharedRefs(cloned);
  });

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    tools: tools,
    $defs: defs
  };
}
