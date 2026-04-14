import { z } from 'zod';
import { zMproveValidationError } from '#common/zod/backend/state/mprove-validation-error';
import { zValidateFilesRepo } from '#common/zod/backend/state/validate-files-repo';

export let zMcpToolValidateFilesInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    repoId: z.string().describe('Repository ID'),
    branchId: z.string().describe('Git branch name'),
    envId: z.string().describe('Environment ID')
  })
  .meta({ id: 'McpToolValidateFilesInput' });

export let zMcpToolValidateFilesOutput = z
  .object({
    needValidate: z.boolean(),
    validationErrorsTotal: z.number(),
    validationErrors: z.array(zMproveValidationError),
    repo: zValidateFilesRepo,
    url: z.string()
  })
  .meta({ id: 'McpToolValidateFilesOutput' });

export type McpToolValidateFilesInput = z.infer<
  typeof zMcpToolValidateFilesInput
>;

export type McpToolValidateFilesOutput = z.infer<
  typeof zMcpToolValidateFilesOutput
>;
