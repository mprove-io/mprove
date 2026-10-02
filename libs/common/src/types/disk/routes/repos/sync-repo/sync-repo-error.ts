import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskDevRepoCommitDoesNotMatchLocalCommitError,
  zDiskDevRepoCommitDoesNotMatchLocalCommitError
} from '#common/types/disk/errors/disk-dev-repo-commit-does-not-match-local-commit-error';
import {
  type DiskPathTraversalError,
  zDiskPathTraversalError
} from '#common/types/disk/errors/disk-path-traversal-error';
import {
  type DiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoIsNotCleanForCheckoutBranchError
} from '#common/types/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import {
  type FileIsSymlinkError,
  zFileIsSymlinkError
} from '#common/types/node-common/errors/file-is-symlink-error';
import {
  type FileSizeIsTooBigError,
  zFileSizeIsTooBigError
} from '#common/types/node-common/errors/file-size-is-too-big-error';

export type ToDiskSyncRepoError =
  | DiskDevRepoCommitDoesNotMatchLocalCommitError
  | DiskPathTraversalError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskSyncRepoError = z.discriminatedUnion('code', [
  zDiskDevRepoCommitDoesNotMatchLocalCommitError,
  zDiskPathTraversalError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<ToDiskSyncRepoError, z.infer<typeof zToDiskSyncRepoError>>({
  value: true
});
