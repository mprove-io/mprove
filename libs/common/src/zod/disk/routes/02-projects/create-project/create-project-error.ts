import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskProjectAlreadyExistError,
  zDiskProjectAlreadyExistError
} from '#common/zod/disk/errors/disk-project-already-exist-error';
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

export type ToDiskCreateProjectError =
  | DiskProjectAlreadyExistError
  | DiskRepoStatusIsNotNeedPushError
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zToDiskCreateProjectError = z.discriminatedUnion('code', [
  zDiskProjectAlreadyExistError,
  zDiskRepoStatusIsNotNeedPushError,
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  ToDiskCreateProjectError,
  z.infer<typeof zToDiskCreateProjectError>
>({ value: true });
