import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskDevRepoCommitDoesNotMatchLocalCommitError,
  zDiskDevRepoCommitDoesNotMatchLocalCommitError
} from '#common/types/disk/errors/disk-dev-repo-commit-does-not-match-local-commit-error';
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
  type DiskGetSyncDataError,
  zDiskGetSyncDataError
} from '#common/types/disk/function-errors/disk-get-sync-data-error';

export type ToDiskSyncRepoError =
  | DiskDevRepoCommitDoesNotMatchLocalCommitError
  | DiskCheckRestoreOrgProjectRepoBranchError
  | DiskCheckoutBranchError
  | DiskGetSyncDataError
  | DiskGetRepoStatusError
  | DiskGetNodesAndFilesError;

export let zToDiskSyncRepoError = z.union([
  zDiskDevRepoCommitDoesNotMatchLocalCommitError,
  zDiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckoutBranchError,
  zDiskGetSyncDataError,
  zDiskGetRepoStatusError,
  zDiskGetNodesAndFilesError
]);

assertTypesEqual<ToDiskSyncRepoError, z.infer<typeof zToDiskSyncRepoError>>({
  value: true
});
