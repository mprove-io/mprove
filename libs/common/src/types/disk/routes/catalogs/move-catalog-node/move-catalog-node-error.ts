import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskFromPathIsNotExistError,
  zDiskFromPathIsNotExistError
} from '#common/types/disk/errors/disk-from-path-is-not-exist-error';
import {
  type DiskToPathAlreadyExistError,
  zDiskToPathAlreadyExistError
} from '#common/types/disk/errors/disk-to-path-already-exist-error';
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
  type ValidatePathUnderDirError,
  zValidatePathUnderDirError
} from '#common/types/node-common/function-errors/validate-path-under-dir-error';

export type ToDiskMoveCatalogNodeError =
  | DiskFromPathIsNotExistError
  | DiskToPathAlreadyExistError
  | ValidatePathUnderDirError
  | DiskCheckRestoreOrgProjectRepoBranchError
  | DiskCheckoutBranchError
  | DiskGetRepoStatusError
  | DiskGetNodesAndFilesError;

export let zToDiskMoveCatalogNodeError = z.union([
  zDiskFromPathIsNotExistError,
  zDiskToPathAlreadyExistError,
  zValidatePathUnderDirError,
  zDiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckoutBranchError,
  zDiskGetRepoStatusError,
  zDiskGetNodesAndFilesError
]);

assertTypesEqual<
  ToDiskMoveCatalogNodeError,
  z.infer<typeof zToDiskMoveCatalogNodeError>
>({ value: true });
