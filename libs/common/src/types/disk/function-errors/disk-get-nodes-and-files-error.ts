import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskGetNodesAndFilesPayloadRecursiveError,
  zDiskGetNodesAndFilesPayloadRecursiveError
} from '#common/types/disk/function-errors/disk-get-nodes-and-files-payload-recursive-error';
import {
  type GetMproveDirError,
  zGetMproveDirError
} from '#common/types/node-common/function-errors/get-mprove-dir-error';

export type DiskGetNodesAndFilesError =
  | GetMproveDirError
  | DiskGetNodesAndFilesPayloadRecursiveError;

export let zDiskGetNodesAndFilesError = z.union([
  zGetMproveDirError,
  zDiskGetNodesAndFilesPayloadRecursiveError
]);

assertTypesEqual<
  DiskGetNodesAndFilesError,
  z.infer<typeof zDiskGetNodesAndFilesError>
>({ value: true });
