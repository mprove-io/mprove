import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskFileIsNotExistError,
  zDiskFileIsNotExistError
} from '#common/zod/disk/errors/disk-file-is-not-exist-error';
import {
  type DiskPathTraversalError,
  zDiskPathTraversalError
} from '#common/zod/disk/errors/disk-path-traversal-error';
import {
  type DiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoIsNotCleanForCheckoutBranchError
} from '#common/zod/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import {
  type DiskRepoStatusIsNotNeedPushError,
  zDiskRepoStatusIsNotNeedPushError
} from '#common/zod/disk/errors/disk-repo-status-is-not-need-push-error';
import {
  type FileIsSymlinkError,
  zFileIsSymlinkError
} from '#common/zod/disk/errors/file-is-symlink-error';
import {
  type FileSizeIsTooBigError,
  zFileSizeIsTooBigError
} from '#common/zod/disk/errors/file-size-is-too-big-error';

export type ToDiskSaveFileError =
  | DiskFileIsNotExistError
  | DiskPathTraversalError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | DiskRepoStatusIsNotNeedPushError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskSaveFileError = z.discriminatedUnion('code', [
  zDiskFileIsNotExistError,
  zDiskPathTraversalError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoStatusIsNotNeedPushError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<ToDiskSaveFileError, z.infer<typeof zToDiskSaveFileError>>({
  value: true
});
