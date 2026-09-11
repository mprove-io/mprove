import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskFileAlreadyExistError,
  zDiskFileAlreadyExistError
} from '#common/zod/disk/errors/disk-file-already-exist-error';
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

export type ToDiskCreateFileError =
  | DiskFileAlreadyExistError
  | DiskPathTraversalError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | DiskRepoStatusIsNotNeedPushError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskCreateFileError = z.discriminatedUnion('code', [
  zDiskFileAlreadyExistError,
  zDiskPathTraversalError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoStatusIsNotNeedPushError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<ToDiskCreateFileError, z.infer<typeof zToDiskCreateFileError>>(
  {
    value: true
  }
);
