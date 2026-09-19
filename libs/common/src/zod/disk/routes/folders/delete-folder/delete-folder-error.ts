import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskFolderIsNotExistError,
  zDiskFolderIsNotExistError
} from '#common/zod/disk/errors/disk-folder-is-not-exist-error';
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

export type ToDiskDeleteFolderError =
  | DiskFolderIsNotExistError
  | DiskPathTraversalError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskDeleteFolderError = z.discriminatedUnion('code', [
  zDiskFolderIsNotExistError,
  zDiskPathTraversalError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskDeleteFolderError,
  z.infer<typeof zToDiskDeleteFolderError>
>({ value: true });
