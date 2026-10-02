import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolValidateFilesInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export let zMcpToolValidateFilesInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    repoId: z.string().describe('Repository ID'),
    branchId: z.string().describe('Git branch name'),
    envId: z.string().describe('Environment ID')
  })
  .meta({ id: 'McpToolValidateFilesInput' });

assertTypesEqual<
  McpToolValidateFilesInput,
  z.infer<typeof zMcpToolValidateFilesInput>
>({ value: true });
