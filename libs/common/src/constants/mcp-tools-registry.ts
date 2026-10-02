import type { z } from 'zod';
import { zMcpToolGetConnectionsListInput } from '#common/types/backend/mcp-tools/mcp-tool-get-connections-list/mcp-tool-get-connections-list-input';
import { zMcpToolGetConnectionsListOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-connections-list/mcp-tool-get-connections-list-output';
import { zMcpToolGetModelInput } from '#common/types/backend/mcp-tools/mcp-tool-get-model/mcp-tool-get-model-input';
import { zMcpToolGetModelOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-model/mcp-tool-get-model-output';
import { zMcpToolGetQueryInfoInput } from '#common/types/backend/mcp-tools/mcp-tool-get-query-info/mcp-tool-get-query-info-input';
import { zMcpToolGetQueryInfoOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-query-info/mcp-tool-get-query-info-output';
import { zMcpToolGetSampleInput } from '#common/types/backend/mcp-tools/mcp-tool-get-sample/mcp-tool-get-sample-input';
import { zMcpToolGetSampleOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-sample/mcp-tool-get-sample-output';
import { zMcpToolGetSchemasInput } from '#common/types/backend/mcp-tools/mcp-tool-get-schemas/mcp-tool-get-schemas-input';
import { zMcpToolGetSchemasOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-schemas/mcp-tool-get-schemas-output';
import { zMcpToolGetSkillsInput } from '#common/types/backend/mcp-tools/mcp-tool-get-skills/mcp-tool-get-skills-input';
import { zMcpToolGetSkillsOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-skills/mcp-tool-get-skills-output';
import { zMcpToolGetStateInput } from '#common/types/backend/mcp-tools/mcp-tool-get-state/mcp-tool-get-state-input';
import { zMcpToolGetStateOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-state/mcp-tool-get-state-output';
import { zMcpToolListDocsInput } from '#common/types/backend/mcp-tools/mcp-tool-list-docs/mcp-tool-list-docs-input';
import { zMcpToolListDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-list-docs/mcp-tool-list-docs-output';
import { zMcpToolReadDocsInput } from '#common/types/backend/mcp-tools/mcp-tool-read-docs/mcp-tool-read-docs-input';
import { zMcpToolReadDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-read-docs/mcp-tool-read-docs-output';
import { zMcpToolRunInput } from '#common/types/backend/mcp-tools/mcp-tool-run/mcp-tool-run-input';
import { zMcpToolRunOutput } from '#common/types/backend/mcp-tools/mcp-tool-run/mcp-tool-run-output';
import { zMcpToolSearchDocsInput } from '#common/types/backend/mcp-tools/mcp-tool-search-docs/mcp-tool-search-docs-input';
import { zMcpToolSearchDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-search-docs/mcp-tool-search-docs-output';
import { zMcpToolValidateFilesInput } from '#common/types/backend/mcp-tools/mcp-tool-validate-files/mcp-tool-validate-files-input';
import { zMcpToolValidateFilesOutput } from '#common/types/backend/mcp-tools/mcp-tool-validate-files/mcp-tool-validate-files-output';

export const MCP_TOOL_RUN = 'run';
export const MCP_TOOL_GET_STATE = 'get-state';
export const MCP_TOOL_GET_MODEL = 'get-model';
export const MCP_TOOL_GET_QUERY_INFO = 'get-query-info';
export const MCP_TOOL_VALIDATE = 'validate';
export const MCP_TOOL_GET_SAMPLE = 'get-sample';
export const MCP_TOOL_GET_SCHEMAS = 'get-schemas';
export const MCP_TOOL_GET_CONNECTIONS_LIST = 'get-connections-list';
export const MCP_TOOL_GET_SKILLS = 'get-skills';
export const MCP_TOOL_READ_DOCS = 'read-docs';
export const MCP_TOOL_LIST_DOCS = 'list-docs';
export const MCP_TOOL_SEARCH_DOCS = 'search-docs';

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
