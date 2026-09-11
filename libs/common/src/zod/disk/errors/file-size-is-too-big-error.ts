import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type FileSizeIsTooBigError = {
  code: 'FILE_SIZE_IS_TOO_BIG';
};

export let zFileSizeIsTooBigError = z.object({
  code: z.literal('FILE_SIZE_IS_TOO_BIG')
});

assertTypesEqual<FileSizeIsTooBigError, z.infer<typeof zFileSizeIsTooBigError>>(
  { value: true }
);
