import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MproveValidationError,
  zMproveValidationError
} from '#common/types/backend/parts/state/mprove-validation-error';
import {
  type ValidateFilesRepo,
  zValidateFilesRepo
} from '#common/types/backend/parts/state/validate-files-repo';

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
