import { z } from 'zod';
import { zMproveValidationErrorLine } from '#common/zod/z-state/z-mprove-validation-error-line';

export let zMproveValidationError = z.object({
  title: z.string(),
  message: z.string(),
  lines: z.array(zMproveValidationErrorLine)
});
