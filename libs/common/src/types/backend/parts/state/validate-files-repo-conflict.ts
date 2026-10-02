import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ValidateFilesRepoConflict = {
  fileId: string;
  fileName: string;
  lineNumber: number;
};

export let zValidateFilesRepoConflict = z
  .object({
    fileId: z.string(),
    fileName: z.string(),
    lineNumber: z.number().int()
  })
  .meta({ id: 'ValidateFilesRepoConflict' });

assertTypesEqual<
  ValidateFilesRepoConflict,
  z.infer<typeof zValidateFilesRepoConflict>
>({ value: true });
