import { z } from 'zod';
import { zModel } from '#common/zod/blockml/model';

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

export let zMcpToolGetModelOutput = z
  .object({
    needValidate: z.boolean(),
    model: zModel
  })
  .meta({ id: 'McpToolGetModelOutput' });

export type McpToolGetModelInput = z.infer<typeof zMcpToolGetModelInput>;

export type McpToolGetModelOutput = z.infer<typeof zMcpToolGetModelOutput>;
