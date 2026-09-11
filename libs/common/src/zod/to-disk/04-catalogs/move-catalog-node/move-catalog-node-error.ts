import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskFromPathIsNotExistError,
  zDiskFromPathIsNotExistError
} from '#common/zod/disk/errors/disk-from-path-is-not-exist-error';
import {
  type DiskPathTraversalError,
  zDiskPathTraversalError
} from '#common/zod/disk/errors/disk-path-traversal-error';
import {
  type DiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoIsNotCleanForCheckoutBranchError
} from '#common/zod/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import {
  type DiskToPathAlreadyExistError,
  zDiskToPathAlreadyExistError
} from '#common/zod/disk/errors/disk-to-path-already-exist-error';
import {
  type FileIsSymlinkError,
  zFileIsSymlinkError
} from '#common/zod/disk/errors/file-is-symlink-error';
import {
  type FileSizeIsTooBigError,
  zFileSizeIsTooBigError
} from '#common/zod/disk/errors/file-size-is-too-big-error';

export type ToDiskMoveCatalogNodeError =
  | DiskFromPathIsNotExistError
  | DiskPathTraversalError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | DiskToPathAlreadyExistError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskMoveCatalogNodeError = z.discriminatedUnion('code', [
  zDiskFromPathIsNotExistError,
  zDiskPathTraversalError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zDiskToPathAlreadyExistError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskMoveCatalogNodeError,
  z.infer<typeof zToDiskMoveCatalogNodeError>
>({ value: true });
