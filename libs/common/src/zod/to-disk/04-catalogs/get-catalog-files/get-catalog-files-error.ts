import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
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

export type ToDiskGetCatalogFilesError =
  | DiskRepoIsNotCleanForCheckoutBranchError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskGetCatalogFilesError = z.discriminatedUnion('code', [
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskGetCatalogFilesError,
  z.infer<typeof zToDiskGetCatalogFilesError>
>({ value: true });
