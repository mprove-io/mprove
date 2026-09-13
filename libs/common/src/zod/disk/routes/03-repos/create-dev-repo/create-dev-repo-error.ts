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

export type ToDiskCreateDevRepoError =
  | DiskRepoIsNotCleanForCheckoutBranchError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskCreateDevRepoError = z.discriminatedUnion('code', [
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskCreateDevRepoError,
  z.infer<typeof zToDiskCreateDevRepoError>
>({ value: true });
