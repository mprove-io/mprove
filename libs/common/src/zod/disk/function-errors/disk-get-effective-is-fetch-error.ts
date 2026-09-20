import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type FileIsSymlinkError,
  zFileIsSymlinkError
} from '#common/zod/node-common/errors/file-is-symlink-error';
import {
  type FileSizeIsTooBigError,
  zFileSizeIsTooBigError
} from '#common/zod/node-common/errors/file-size-is-too-big-error';

export type DiskGetEffectiveIsFetchError =
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zDiskGetEffectiveIsFetchError = z.discriminatedUnion('code', [
  zFileIsSymlinkError,
  zFileSizeIsTooBigError
]);

assertTypesEqual<
  DiskGetEffectiveIsFetchError,
  z.infer<typeof zDiskGetEffectiveIsFetchError>
>({ value: true });
