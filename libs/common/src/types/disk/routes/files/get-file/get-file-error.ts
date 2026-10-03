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
  type DiskGetFileContentError,
  zDiskGetFileContentError
} from '#common/types/disk/function-errors/disk-get-file-content-error';
import {
  type DiskGetNodesAndFilesError,
  zDiskGetNodesAndFilesError
} from '#common/types/disk/function-errors/disk-get-nodes-and-files-error';
import {
  type DiskGetRepoStatusError,
  zDiskGetRepoStatusError
} from '#common/types/disk/function-errors/disk-get-repo-status-error';
import {
  type ValidatePathUnderDirError,
  zValidatePathUnderDirError
} from '#common/types/node-common/function-errors/validate-path-under-dir-error';

export type ToDiskGetFileError =
  | DiskFileIsNotExistError
  | ValidatePathUnderDirError
  | DiskCheckRestoreOrgProjectRepoBranchError
  | DiskCheckoutBranchError
  | DiskGetFileContentError
  | DiskGetRepoStatusError
  | DiskGetNodesAndFilesError;

export let zToDiskGetFileError = z.union([
  zDiskFileIsNotExistError,
  zValidatePathUnderDirError,
  zDiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckoutBranchError,
  zDiskGetFileContentError,
  zDiskGetRepoStatusError,
  zDiskGetNodesAndFilesError
]);

assertTypesEqual<ToDiskGetFileError, z.infer<typeof zToDiskGetFileError>>({
  value: true
});
