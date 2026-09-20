import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskBranchIsNotExistError,
  zDiskBranchIsNotExistError
} from '#common/zod/disk/errors/disk-branch-is-not-exist-error';

export type DiskDeleteBranchFromRepositoriesError = DiskBranchIsNotExistError;

export let zDiskDeleteBranchFromRepositoriesError = zDiskBranchIsNotExistError;

assertTypesEqual<
  DiskDeleteBranchFromRepositoriesError,
  z.infer<typeof zDiskDeleteBranchFromRepositoriesError>
>({ value: true });
