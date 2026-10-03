import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MproveValidationErrorLine = {
  filePath: string;
  fileName: string;
  lineNumber: number;
};

export let zMproveValidationErrorLine = z
  .object({
    filePath: z.string(),
    fileName: z.string(),
    lineNumber: z.number().int()
  })
  .meta({ id: 'MproveValidationErrorLine' });

assertTypesEqual<
  MproveValidationErrorLine,
  z.infer<typeof zMproveValidationErrorLine>
>({ value: true });
