import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskGetNodesAndFilesPayloadRecursiveError,
  zDiskGetNodesAndFilesPayloadRecursiveError
} from '#common/zod/disk/function-errors/disk-get-nodes-and-files-payload-recursive-error';

export type DiskGetNodesAndFilesError =
  DiskGetNodesAndFilesPayloadRecursiveError;

export let zDiskGetNodesAndFilesError =
  zDiskGetNodesAndFilesPayloadRecursiveError;

assertTypesEqual<
  DiskGetNodesAndFilesError,
  z.infer<typeof zDiskGetNodesAndFilesError>
>({ value: true });
