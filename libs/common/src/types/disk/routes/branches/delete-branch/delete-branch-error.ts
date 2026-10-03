import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskDefaultBranchCannotBeDeletedError,
  zDiskDefaultBranchCannotBeDeletedError
} from '#common/types/disk/errors/disk-default-branch-cannot-be-deleted-error';
import {
  type DiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckRestoreOrgProjectRepoBranchError
} from '#common/types/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import {
  type DiskCheckoutBranchError,
  zDiskCheckoutBranchError
} from '#common/types/disk/function-errors/disk-checkout-branch-error';
import {
  type DiskDeleteBranchFromRepositoriesError,
  zDiskDeleteBranchFromRepositoriesError
} from '#common/types/disk/function-errors/disk-delete-branch-from-repositories-error';
import {
  type DiskGetNodesAndFilesError,
  zDiskGetNodesAndFilesError
} from '#common/types/disk/function-errors/disk-get-nodes-and-files-error';
import {
  type DiskGetRepoStatusError,
  zDiskGetRepoStatusError
} from '#common/types/disk/function-errors/disk-get-repo-status-error';

export type ToDiskDeleteBranchError =
  | DiskDefaultBranchCannotBeDeletedError
  | DiskCheckRestoreOrgProjectRepoBranchError
  | DiskCheckoutBranchError
  | DiskDeleteBranchFromRepositoriesError
  | DiskGetRepoStatusError
  | DiskGetNodesAndFilesError;

export let zToDiskDeleteBranchError = z.union([
  zDiskDefaultBranchCannotBeDeletedError,
  zDiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckoutBranchError,
  zDiskDeleteBranchFromRepositoriesError,
  zDiskGetRepoStatusError,
  zDiskGetNodesAndFilesError
]);

assertTypesEqual<
  ToDiskDeleteBranchError,
  z.infer<typeof zToDiskDeleteBranchError>
>({ value: true });
