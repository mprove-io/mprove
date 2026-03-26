import { z } from 'zod';

export let zMproveValidationErrorLine = z.object({
  filePath: z.string(),
  fileName: z.string(),
  lineNumber: z.number()
});
