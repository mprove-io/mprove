import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskRemoteBranchIsNotExistError,
  zDiskRemoteBranchIsNotExistError
} from '#common/zod/disk/errors/disk-remote-branch-is-not-exist-error';
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

export type ToDiskRevertRepoToRemoteError =
  | DiskRemoteBranchIsNotExistError
  | DiskRepoIsNotCleanForCheckoutBranchError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskRevertRepoToRemoteError = z.discriminatedUnion('code', [
  zDiskRemoteBranchIsNotExistError,
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskRevertRepoToRemoteError,
  z.infer<typeof zToDiskRevertRepoToRemoteError>
>({ value: true });
