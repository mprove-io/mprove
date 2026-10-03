import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MproveValidationErrorLine,
  zMproveValidationErrorLine
} from '#common/types/backend/parts/state/mprove-validation-error-line';

export type MproveValidationError = {
  title: string;
  message: string;
  lines: MproveValidationErrorLine[];
};

export let zMproveValidationError = z
  .object({
    title: z.string(),
    message: z.string(),
    lines: z.array(zMproveValidationErrorLine)
  })
  .meta({ id: 'MproveValidationError' });

assertTypesEqual<MproveValidationError, z.infer<typeof zMproveValidationError>>(
  { value: true }
);
