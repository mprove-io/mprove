import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskDevRepoCommitDoesNotMatchLocalCommitError,
  zDiskDevRepoCommitDoesNotMatchLocalCommitError
} from '#common/zod/disk/errors/disk-dev-repo-commit-does-not-match-local-commit-error';
import {
  type DiskPathTraversalError,
  zDiskPathTraversalError
} from '#common/zod/disk/errors/disk-path-traversal-error';
import {
  type DiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoIsNotCleanForCheckoutBranchError
} from '#common/zod/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import {
  type FileIsSymlinkError,
  zFileIsSymlinkError
} from '#common/zod/disk/errors/file-is-symlink-error';
import {
  type FileSizeIsTooBigError,
  zFileSizeIsTooBigError
} from '#common/zod/disk/errors/file-size-is-too-big-error';

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
