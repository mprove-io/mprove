import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskGetRepoConflictsError,
  zDiskGetRepoConflictsError
} from '#common/zod/disk/function-errors/disk-get-repo-conflicts-error';

export type DiskGetRepoStatusError = DiskGetRepoConflictsError;

export let zDiskGetRepoStatusError = zDiskGetRepoConflictsError;

assertTypesEqual<
  DiskGetRepoStatusError,
  z.infer<typeof zDiskGetRepoStatusError>
>({
  value: true
});
