import { z } from 'zod';

export let zMproveValidationErrorLine = z
  .object({
    filePath: z.string(),
    fileName: z.string(),
    lineNumber: z.number().int()
  })
  .meta({ id: 'MproveValidationErrorLine' });

export type MproveValidationErrorLine = z.infer<
  typeof zMproveValidationErrorLine
>;
