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

export type DiskGetNodesAndFilesPayloadRecursiveError =
  | FileIsSymlinkError
  | FileSizeIsTooBigError;

export let zDiskGetNodesAndFilesPayloadRecursiveError = z.discriminatedUnion(
  'code',
  [zFileIsSymlinkError, zFileSizeIsTooBigError]
);

assertTypesEqual<
  DiskGetNodesAndFilesPayloadRecursiveError,
  z.infer<typeof zDiskGetNodesAndFilesPayloadRecursiveError>
>({ value: true });
