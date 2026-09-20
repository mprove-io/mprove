import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskWriteDefaultInitialProjectFilesError,
  zDiskWriteDefaultInitialProjectFilesError
} from '#common/zod/disk/function-errors/disk-write-default-initial-project-files-error';

export type DiskPrepareInitialProjectFilesError =
  DiskWriteDefaultInitialProjectFilesError;

export let zDiskPrepareInitialProjectFilesError =
  zDiskWriteDefaultInitialProjectFilesError;

assertTypesEqual<
  DiskPrepareInitialProjectFilesError,
  z.infer<typeof zDiskPrepareInitialProjectFilesError>
>({ value: true });
