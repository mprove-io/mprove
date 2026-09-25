import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskPrepareInitialProjectFilesError,
  zDiskPrepareInitialProjectFilesError
} from '#common/zod/disk/function-errors/disk-prepare-initial-project-files-error';

export type DiskCreateInitialCommitToProdError =
  DiskPrepareInitialProjectFilesError;

export let zDiskCreateInitialCommitToProdError =
  zDiskPrepareInitialProjectFilesError;

assertTypesEqual<
  DiskCreateInitialCommitToProdError,
  z.infer<typeof zDiskCreateInitialCommitToProdError>
>({ value: true });
