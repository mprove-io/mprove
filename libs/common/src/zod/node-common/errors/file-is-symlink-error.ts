import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type FileIsSymlinkError = {
  code: 'FILE_IS_SYMLINK';
};

export let zFileIsSymlinkError = z.object({
  code: z.literal('FILE_IS_SYMLINK')
});

assertTypesEqual<FileIsSymlinkError, z.infer<typeof zFileIsSymlinkError>>({
  value: true
});
