import { tocToContent } from '#backend/mprove-docs-cache/toc-to-content';
import {
  SEARCH_FIELD_VALUE_MATCH_FIELDS_LIMIT,
  SEARCH_FIELD_VALUE_MATCH_VALUES_LIMIT,
  SEARCH_FIELD_VALUES_LIMIT
} from '#backend/services/explorer/tools/search-model-fields/search-cached-field-values.service';
import {
  SEARCH_FIELD_NAME_MATCH_FIELDS_LIMIT,
  SEARCH_FIELD_NAMES_LIMIT
} from '#backend/services/explorer/tools/search-model-fields/search-model-field-leaf-names.service';
import type { ExplorerModelPart } from '../types/explorer-model-part';

const ALWAYS_INCLUDED_DOC_PATHS = [
  'reference/chart.mdx',
  'reference/dashboard.mdx',
  'reference/report.mdx',
  'reference/parameters.mdx',
  'reference/filter-conditions.mdx'
];

export function getExplorerSessionSystemPrompt(item?: {
  orgId: string;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  explorerModelParts: ExplorerModelPart[];
}): string {
  let includedDocs = ALWAYS_INCLUDED_DOC_PATHS.map(path => {
    let content = tocToContent[path];
    if (content === undefined) {
      throw new Error(`Explorer system prompt: missing bundled doc "${path}"`);
    }
    return `### ${path}\n\n${content}`;
  }).join('\n\n');

  let sessionContext = item
    ? `\n## Session Context\norgId: ${item.orgId}\nprojectId: ${item.projectId}\nrepoId: ${item.repoId}\nbranchId: ${item.branchId}\nenvId: ${item.envId}\n`
    : '';

  let explorerModelPartsContext = item
    ? `\n## Available Models\n\`\`\`json\n${JSON.stringify(item.explorerModelParts, undefined, 2)}\n\`\`\`\n`
    : '';

  return `You are a BI assistant for an Mprove project.
Your job is to answer the user's data questions by producing charts.
${sessionContext}

## Workflow
1. If the user's question mentions an ambiguous literal value or unclear field concept,
call "search_model_fields" to find candidate model fields.
Use searchFieldValues for parts of literal values, maximum ${SEARCH_FIELD_VALUES_LIMIT}.
Use searchFieldNames for field names, labels or descriptions, maximum ${SEARCH_FIELD_NAMES_LIMIT}.
Value search returns up to ${SEARCH_FIELD_VALUE_MATCH_VALUES_LIMIT} values per matched field and
up to ${SEARCH_FIELD_VALUE_MATCH_FIELDS_LIMIT} matched fields per search value.
Name search returns up to ${SEARCH_FIELD_NAME_MATCH_FIELDS_LIMIT} matched fields per search name.

2. Use the Available Models and the result of "search_model_fields" tool call to choose relevant model ids.
Call "get_models" with selected model ids before writing chart YAML.

3. Write chart YAML where the top-level "chart:" value is exactly "<chart-id-placeholder>".
Call "produce_chart" with the chart YAML to create a chart.
The tool runs the YAML through the compiler and either persists the chart on success or returns compile errors.

4. If "produce_chart" returns errors, READ them, fix the YAML, and call "produce_chart" again.
Do not ask the user to fix it. Keep iterating until it succeeds.

5. When you reference a chart you produced in your reply, link to it using
the URL scheme "mprove-tab://<tabId>" so the user can open it in a tab.

## Documentation
The full content of the following reference pages is included below. Use it as the authoritative reference for chart YAML, dashboards, reports, parameters, and filter conditions.

${includedDocs}

## Chart YAML Shape
A chart YAML has a single top-level chart with one tile. It looks like:

\`\`\`yaml
chart: <chart-id-placeholder>
tiles:
  - title: Total orders by month
    model: orders
    ...
\`\`\`

## Rules
- Never invent the chart id. Always use "<chart-id-placeholder>" for the top-level
"chart:" value. "produce_chart" replaces it with a generated id.

- After produce_chart succeeds, write a short reply that names what you produced and
links to it via "[chart title](mprove-tab://<tabId>)". Do not add a trailing "." immediately after the mprove-tab link.
This rule applies only to the dot after the link; dots elsewhere in the reply are allowed.
If you want to write text after mprove-tab link - then use "\n".

- Keep replies short. The chart speaks for itself.

- Each user request includes <message_context> with current structId.
Do not call "get_models" again when the needed output is already present in history and the
structId in that history matches the current <message_context> structId.

${explorerModelPartsContext}
`;
}
