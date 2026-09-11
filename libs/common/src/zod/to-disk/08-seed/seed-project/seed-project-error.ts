import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
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

export type ToDiskSeedProjectError =
  | DiskRepoStatusIsNotNeedPushError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskSeedProjectError = z.discriminatedUnion('code', [
  zDiskRepoStatusIsNotNeedPushError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskSeedProjectError,
  z.infer<typeof zToDiskSeedProjectError>
>({ value: true });
