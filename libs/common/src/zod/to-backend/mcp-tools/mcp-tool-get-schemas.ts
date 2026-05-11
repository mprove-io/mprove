import { z } from 'zod';
import { zCombinedSchemaItem } from '#common/zod/backend/connection-schemas/combined-schema';

export let zMcpToolGetSchemasInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    envId: z.string().describe('Environment ID'),
    repoId: z.string().describe('Repository ID'),
    branchId: z.string().describe('Git branch name'),
    isRefreshExistingCache: z
      .boolean()
      .describe('Refresh cached schemas from the database')
  })
  .meta({ id: 'McpToolGetSchemasInput' });

export let zMcpToolGetSchemasOutput = z
  .object({
    combinedSchemaItems: z.array(zCombinedSchemaItem)
  })
  .meta({ id: 'McpToolGetSchemasOutput' });

export type McpToolGetSchemasInput = z.infer<typeof zMcpToolGetSchemasInput>;

export type McpToolGetSchemasOutput = z.infer<typeof zMcpToolGetSchemasOutput>;
