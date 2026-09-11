import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskFolderAlreadyExistError,
  zDiskFolderAlreadyExistError
} from '#common/zod/disk/errors/disk-folder-already-exist-error';
import {
  type DiskParentPathIsNotExistError,
  zDiskParentPathIsNotExistError
} from '#common/zod/disk/errors/disk-parent-path-is-not-exist-error';
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

export type ToDiskCreateFolderError =
  | DiskFolderAlreadyExistError
  | DiskParentPathIsNotExistError
  | DiskPathTraversalError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskCreateFolderError = z.discriminatedUnion('code', [
  zDiskFolderAlreadyExistError,
  zDiskParentPathIsNotExistError,
  zDiskPathTraversalError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskCreateFolderError,
  z.infer<typeof zToDiskCreateFolderError>
>({ value: true });
