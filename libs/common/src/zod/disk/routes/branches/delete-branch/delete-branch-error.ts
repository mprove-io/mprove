import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskDefaultBranchCannotBeDeletedError,
  zDiskDefaultBranchCannotBeDeletedError
} from '#common/zod/disk/errors/disk-default-branch-cannot-be-deleted-error';
import {
  type DiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckRestoreOrgProjectRepoBranchError
} from '#common/zod/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import {
  type DiskDeleteBranchFromRepositoriesError,
  zDiskDeleteBranchFromRepositoriesError
} from '#common/zod/disk/function-errors/disk-delete-branch-from-repositories-error';

export type ToDiskDeleteBranchError =
  | DiskDefaultBranchCannotBeDeletedError
  | DiskCheckRestoreOrgProjectRepoBranchError
  | DiskDeleteBranchFromRepositoriesError;

export let zToDiskDeleteBranchError = z.union([
  zDiskDefaultBranchCannotBeDeletedError,
  zDiskCheckRestoreOrgProjectRepoBranchError,
  zDiskDeleteBranchFromRepositoriesError
]);

assertTypesEqual<
  ToDiskDeleteBranchError,
  z.infer<typeof zToDiskDeleteBranchError>
>({ value: true });
