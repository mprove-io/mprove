import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskFileIsNotExistError,
  zDiskFileIsNotExistError
} from '#common/types/disk/errors/disk-file-is-not-exist-error';
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
import {
  type DiskPushToRemoteError,
  zDiskPushToRemoteError
} from '#common/types/disk/function-errors/disk-push-to-remote-error';
import {
  type DiskWriteToFileError,
  zDiskWriteToFileError
} from '#common/types/disk/function-errors/disk-write-to-file-error';
import {
  type ValidatePathUnderDirError,
  zValidatePathUnderDirError
} from '#common/types/node-common/function-errors/validate-path-under-dir-error';

export type ToDiskSaveFileError =
  | DiskFileIsNotExistError
  | ValidatePathUnderDirError
  | DiskCheckRestoreOrgProjectRepoBranchError
  | DiskCheckoutBranchError
  | DiskWriteToFileError
  | DiskPushToRemoteError
  | DiskGetRepoStatusError
  | DiskGetNodesAndFilesError;

export let zToDiskSaveFileError = z.union([
  zDiskFileIsNotExistError,
  zValidatePathUnderDirError,
  zDiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckoutBranchError,
  zDiskWriteToFileError,
  zDiskPushToRemoteError,
  zDiskGetRepoStatusError,
  zDiskGetNodesAndFilesError
]);

assertTypesEqual<ToDiskSaveFileError, z.infer<typeof zToDiskSaveFileError>>({
  value: true
});
