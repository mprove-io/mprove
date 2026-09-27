import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MproveValidationError,
  zMproveValidationError
} from '#common/zod/backend/state/mprove-validation-error';
import {
  type ValidateFilesRepo,
  zValidateFilesRepo
} from '#common/zod/backend/state/validate-files-repo';

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

export type McpToolValidateFilesOutput = {
  needValidate: boolean;
  validationErrorsTotal: number;
  validationErrors: MproveValidationError[];
  repo: ValidateFilesRepo;
  url: string;
};

export let zMcpToolValidateFilesOutput = z
  .object({
    needValidate: z.boolean(),
    validationErrorsTotal: z.number(),
    validationErrors: z.array(zMproveValidationError),
    repo: zValidateFilesRepo,
    url: z.string()
  })
  .meta({ id: 'McpToolValidateFilesOutput' });

assertTypesEqual<
  McpToolValidateFilesOutput,
  z.infer<typeof zMcpToolValidateFilesOutput>
>({ value: true });
