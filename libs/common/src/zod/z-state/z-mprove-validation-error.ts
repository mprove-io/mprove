import { z } from 'zod';
import { zMproveValidationErrorLine } from '#common/zod/z-state/z-mprove-validation-error-line';

export let zMproveValidationError = z.object({
  title: z.string().nullish(),
  message: z.string().nullish(),
  lines: z.array(zMproveValidationErrorLine).nullish()
});
