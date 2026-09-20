import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskGetNodesAndFilesError,
  zDiskGetNodesAndFilesError
} from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';

export type DiskGetRepoConflictsError = DiskGetNodesAndFilesError;

export let zDiskGetRepoConflictsError = zDiskGetNodesAndFilesError;

assertTypesEqual<
  DiskGetRepoConflictsError,
  z.infer<typeof zDiskGetRepoConflictsError>
>({ value: true });
