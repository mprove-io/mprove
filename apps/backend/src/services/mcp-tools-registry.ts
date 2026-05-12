import type { z } from 'zod';
import {
  MCP_TOOL_GET_CONNECTIONS_LIST,
  MCP_TOOL_GET_MODEL,
  MCP_TOOL_GET_QUERY_INFO,
  MCP_TOOL_GET_SAMPLE,
  MCP_TOOL_GET_SCHEMAS,
  MCP_TOOL_GET_SKILLS,
  MCP_TOOL_GET_STATE,
  MCP_TOOL_LIST_DOCS,
  MCP_TOOL_READ_DOCS,
  MCP_TOOL_RUN,
  MCP_TOOL_SEARCH_DOCS,
  MCP_TOOL_VALIDATE
} from '#common/constants/top-backend';
import {
  zMcpToolGetConnectionsListInput,
  zMcpToolGetConnectionsListOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-get-connections-list';
import {
  zMcpToolGetModelInput,
  zMcpToolGetModelOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-get-model';
import {
  zMcpToolGetQueryInfoInput,
  zMcpToolGetQueryInfoOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-get-query-info';
import {
  zMcpToolGetSampleInput,
  zMcpToolGetSampleOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-get-sample';
import {
  zMcpToolGetSchemasInput,
  zMcpToolGetSchemasOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-get-schemas';
import {
  zMcpToolGetSkillsInput,
  zMcpToolGetSkillsOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-get-skills';
import {
  zMcpToolGetStateInput,
  zMcpToolGetStateOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-get-state';
import {
  zMcpToolListDocsInput,
  zMcpToolListDocsOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-list-docs';
import {
  zMcpToolReadDocsInput,
  zMcpToolReadDocsOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-read-docs';
import {
  zMcpToolRunInput,
  zMcpToolRunOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-run';
import {
  zMcpToolSearchDocsInput,
  zMcpToolSearchDocsOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-search-docs';
import {
  zMcpToolValidateFilesInput,
  zMcpToolValidateFilesOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-validate-files';

export const MCP_TOOL_GET_SAMPLE_DESCRIPTION =
  'Fetch sample data rows from a database table or column for a project connection';

export const MCP_TOOL_GET_SCHEMAS_DESCRIPTION =
  'Fetch database schemas (tables, columns, relationships, indexes) for project SQL connections';

export const MCP_TOOL_GET_CONNECTIONS_LIST_DESCRIPTION =
  'Get connection info (type, API endpoints, header keys, OAuth scopes) for project connections';

export const MCP_TOOL_GET_MODEL_DESCRIPTION =
  'Get a model definition including its fields, dimensions, measures, and access info';

export const MCP_TOOL_GET_QUERY_INFO_DESCRIPTION =
  'Get query info for a chart, dashboard, or report. Returns query status, SQL, malloy and data.';

export const MCP_TOOL_GET_SKILLS_DESCRIPTION =
  'Get all available mprove skills';

export const MCP_TOOL_GET_STATE_DESCRIPTION =
  'Get project state: models, dashboards, charts, reports, metrics, validation errors, and repo info';

export const MCP_TOOL_LIST_DOCS_DESCRIPTION = `List available Mprove documentation pageIds sourced from https://docs.mprove.io/content/docs/docs-for-ai.mdx.
PageIds can be used in read-docs tool to get page content.`;

export const MCP_TOOL_READ_DOCS_DESCRIPTION = `Read Mprove documentation pages sourced from https://docs.mprove.io/content/docs/docs-for-ai.mdx.
Call with pageIds to read one or more pages in one tool call.`;

export const MCP_TOOL_RUN_DESCRIPTION =
  'Run dashboards, charts, and reports queries. Returns query statuses and statistics.';

export const MCP_TOOL_SEARCH_DOCS_DESCRIPTION = `Search Mprove documentation pages sourced from https://docs.mprove.io/content/docs/docs-for-ai.mdx.
Whitespace-separated query terms are AND-matched (case-insensitive) across cached docs content;
returns matching page ids with snippet previews.`;

export const MCP_TOOL_VALIDATE_DESCRIPTION =
  'Validate (rebuild) Mprove files for a project branch and environment';

export interface McpToolRegistryEntry {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  outputSchema: z.ZodType;
}

export const mcpToolsRegistry: McpToolRegistryEntry[] = [
  {
    name: MCP_TOOL_RUN,
    description: MCP_TOOL_RUN_DESCRIPTION,
    inputSchema: zMcpToolRunInput,
    outputSchema: zMcpToolRunOutput
  },
  {
    name: MCP_TOOL_GET_STATE,
    description: MCP_TOOL_GET_STATE_DESCRIPTION,
    inputSchema: zMcpToolGetStateInput,
    outputSchema: zMcpToolGetStateOutput
  },
  {
    name: MCP_TOOL_GET_MODEL,
    description: MCP_TOOL_GET_MODEL_DESCRIPTION,
    inputSchema: zMcpToolGetModelInput,
    outputSchema: zMcpToolGetModelOutput
  },
  {
    name: MCP_TOOL_GET_QUERY_INFO,
    description: MCP_TOOL_GET_QUERY_INFO_DESCRIPTION,
    inputSchema: zMcpToolGetQueryInfoInput,
    outputSchema: zMcpToolGetQueryInfoOutput
  },
  {
    name: MCP_TOOL_VALIDATE,
    description: MCP_TOOL_VALIDATE_DESCRIPTION,
    inputSchema: zMcpToolValidateFilesInput,
    outputSchema: zMcpToolValidateFilesOutput
  },
  {
    name: MCP_TOOL_GET_SAMPLE,
    description: MCP_TOOL_GET_SAMPLE_DESCRIPTION,
    inputSchema: zMcpToolGetSampleInput,
    outputSchema: zMcpToolGetSampleOutput
  },
  {
    name: MCP_TOOL_GET_SCHEMAS,
    description: MCP_TOOL_GET_SCHEMAS_DESCRIPTION,
    inputSchema: zMcpToolGetSchemasInput,
    outputSchema: zMcpToolGetSchemasOutput
  },
  {
    name: MCP_TOOL_GET_CONNECTIONS_LIST,
    description: MCP_TOOL_GET_CONNECTIONS_LIST_DESCRIPTION,
    inputSchema: zMcpToolGetConnectionsListInput,
    outputSchema: zMcpToolGetConnectionsListOutput
  },
  {
    name: MCP_TOOL_GET_SKILLS,
    description: MCP_TOOL_GET_SKILLS_DESCRIPTION,
    inputSchema: zMcpToolGetSkillsInput,
    outputSchema: zMcpToolGetSkillsOutput
  },
  {
    name: MCP_TOOL_READ_DOCS,
    description: MCP_TOOL_READ_DOCS_DESCRIPTION,
    inputSchema: zMcpToolReadDocsInput,
    outputSchema: zMcpToolReadDocsOutput
  },
  {
    name: MCP_TOOL_LIST_DOCS,
    description: MCP_TOOL_LIST_DOCS_DESCRIPTION,
    inputSchema: zMcpToolListDocsInput,
    outputSchema: zMcpToolListDocsOutput
  },
  {
    name: MCP_TOOL_SEARCH_DOCS,
    description: MCP_TOOL_SEARCH_DOCS_DESCRIPTION,
    inputSchema: zMcpToolSearchDocsInput,
    outputSchema: zMcpToolSearchDocsOutput
  }
];
