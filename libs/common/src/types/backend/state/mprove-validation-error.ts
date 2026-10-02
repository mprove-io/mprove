import { z } from 'zod';
import { zMproveValidationErrorLine } from '#common/types/backend/state/mprove-validation-error-line';

export let zMproveValidationError = z
  .object({
    title: z.string(),
    message: z.string(),
    lines: z.array(zMproveValidationErrorLine)
  })
  .meta({ id: 'MproveValidationError' });

export type MproveValidationError = z.infer<typeof zMproveValidationError>;
