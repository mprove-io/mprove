import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
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

export type ToDiskPushRepoError =
  | DiskRepoIsNotCleanForCheckoutBranchError
  | DiskRepoStatusIsNotNeedPushError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskPushRepoError = z.discriminatedUnion('code', [
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoStatusIsNotNeedPushError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<ToDiskPushRepoError, z.infer<typeof zToDiskPushRepoError>>({
  value: true
});
