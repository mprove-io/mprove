import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

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
