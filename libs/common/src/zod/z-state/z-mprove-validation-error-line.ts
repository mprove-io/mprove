import { z } from 'zod';

export let zMproveValidationErrorLine = z.object({
  filePath: z.string().nullish(),
  fileName: z.string().nullish(),
  lineNumber: z.number().nullish()
});
