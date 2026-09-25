import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskWriteToFileError,
  zDiskWriteToFileError
} from '#common/zod/disk/function-errors/disk-write-to-file-error';

export type DiskWriteDefaultInitialProjectFilesError = DiskWriteToFileError;

export let zDiskWriteDefaultInitialProjectFilesError = zDiskWriteToFileError;

assertTypesEqual<
  DiskWriteDefaultInitialProjectFilesError,
  z.infer<typeof zDiskWriteDefaultInitialProjectFilesError>
>({ value: true });
