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
  type FileIsSymlinkError,
  zFileIsSymlinkError
} from '#common/zod/disk/errors/file-is-symlink-error';
import {
  type FileSizeIsTooBigError,
  zFileSizeIsTooBigError
} from '#common/zod/disk/errors/file-size-is-too-big-error';

export type ToDiskGetFileError =
  | DiskFileIsNotExistError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | DiskPathTraversalError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskGetFileError = z.discriminatedUnion('code', [
  zDiskFileIsNotExistError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zDiskPathTraversalError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<ToDiskGetFileError, z.infer<typeof zToDiskGetFileError>>({
  value: true
});
