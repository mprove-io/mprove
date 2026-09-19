import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskNewPathAlreadyExistError,
  zDiskNewPathAlreadyExistError
} from '#common/zod/disk/errors/disk-new-path-already-exist-error';
import {
  type DiskOldPathIsNotExistError,
  zDiskOldPathIsNotExistError
} from '#common/zod/disk/errors/disk-old-path-is-not-exist-error';
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

export type ToDiskRenameCatalogNodeError =
  | DiskNewPathAlreadyExistError
  | DiskOldPathIsNotExistError
  | DiskPathTraversalError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskRenameCatalogNodeError = z.discriminatedUnion('code', [
  zDiskNewPathAlreadyExistError,
  zDiskOldPathIsNotExistError,
  zDiskPathTraversalError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskRenameCatalogNodeError,
  z.infer<typeof zToDiskRenameCatalogNodeError>
>({ value: true });
