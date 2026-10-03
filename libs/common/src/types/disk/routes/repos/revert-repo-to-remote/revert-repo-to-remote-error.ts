import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskRemoteBranchIsNotExistError,
  zDiskRemoteBranchIsNotExistError
} from '#common/types/disk/errors/disk-remote-branch-is-not-exist-error';
import {
  type DiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckRestoreOrgProjectRepoBranchError
} from '#common/types/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import {
  type DiskCheckoutBranchError,
  zDiskCheckoutBranchError
} from '#common/types/disk/function-errors/disk-checkout-branch-error';
import {
  type DiskGetNodesAndFilesError,
  zDiskGetNodesAndFilesError
} from '#common/types/disk/function-errors/disk-get-nodes-and-files-error';
import {
  type DiskGetRepoStatusError,
  zDiskGetRepoStatusError
} from '#common/types/disk/function-errors/disk-get-repo-status-error';

export type ToDiskRevertRepoToRemoteError =
  | DiskRemoteBranchIsNotExistError
  | DiskCheckRestoreOrgProjectRepoBranchError
  | DiskCheckoutBranchError
  | DiskGetRepoStatusError
  | DiskGetNodesAndFilesError;

export let zToDiskRevertRepoToRemoteError = z.union([
  zDiskRemoteBranchIsNotExistError,
  zDiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckoutBranchError,
  zDiskGetRepoStatusError,
  zDiskGetNodesAndFilesError
]);

assertTypesEqual<
  ToDiskRevertRepoToRemoteError,
  z.infer<typeof zToDiskRevertRepoToRemoteError>
>({ value: true });
