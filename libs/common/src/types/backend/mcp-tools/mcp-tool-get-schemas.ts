import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CombinedSchemaItem,
  zCombinedSchemaItem
} from '#common/types/backend/connection-schemas/combined-schema';

export type McpToolGetSchemasInput = {
  projectId: string;
  envId: string;
  repoId: string;
  branchId: string;
  isRefreshExistingCache: boolean;
};

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

assertTypesEqual<
  McpToolGetSchemasInput,
  z.infer<typeof zMcpToolGetSchemasInput>
>({ value: true });

export type McpToolGetSchemasOutput = {
  combinedSchemaItems: CombinedSchemaItem[];
};

export let zMcpToolGetSchemasOutput = z
  .object({
    combinedSchemaItems: z.array(zCombinedSchemaItem)
  })
  .meta({ id: 'McpToolGetSchemasOutput' });

assertTypesEqual<
  McpToolGetSchemasOutput,
  z.infer<typeof zMcpToolGetSchemasOutput>
>({ value: true });
