import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Model, zModel } from '#common/types/blockml/parts/model';

export type McpToolGetModelInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  modelId: string;
  getMalloy: boolean;
};

export let zMcpToolGetModelInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    repoId: z.string().describe('Repository ID'),
    branchId: z.string().describe('Git branch name'),
    envId: z.string().describe('Environment ID'),
    modelId: z.string().describe('Model ID'),
    getMalloy: z
      .boolean()
      .default(false)
      .describe('Include Malloy source in output')
  })
  .meta({ id: 'McpToolGetModelInput' });

assertTypesEqual<McpToolGetModelInput, z.infer<typeof zMcpToolGetModelInput>>({
  value: true
});

export type McpToolGetModelOutput = {
  needValidate: boolean;
  model: Model;
};

export let zMcpToolGetModelOutput = z
  .object({
    needValidate: z.boolean(),
    model: zModel
  })
  .meta({ id: 'McpToolGetModelOutput' });

assertTypesEqual<McpToolGetModelOutput, z.infer<typeof zMcpToolGetModelOutput>>(
  { value: true }
);
