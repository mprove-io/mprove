import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type FileIsSymlinkError,
  zFileIsSymlinkError
} from '#common/zod/node-common/errors/file-is-symlink-error';

export type DiskWriteToFileError = FileIsSymlinkError;

export let zDiskWriteToFileError = zFileIsSymlinkError;

assertTypesEqual<DiskWriteToFileError, z.infer<typeof zDiskWriteToFileError>>({
  value: true
});
