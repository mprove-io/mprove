import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskGetNodesAndFilesError,
  zDiskGetNodesAndFilesError
} from '#common/types/disk/function-errors/disk-get-nodes-and-files-error';
import {
  type DiskGetRepoStatusError,
  zDiskGetRepoStatusError
} from '#common/types/disk/function-errors/disk-get-repo-status-error';
import {
  type DiskPrepareRemoteAndProdError,
  zDiskPrepareRemoteAndProdError
} from '#common/types/disk/function-errors/disk-prepare-remote-and-prod-error';

export type ToDiskSeedProjectError =
  | DiskPrepareRemoteAndProdError
  | DiskGetNodesAndFilesError
  | DiskGetRepoStatusError;

export let zToDiskSeedProjectError = z.union([
  zDiskPrepareRemoteAndProdError,
  zDiskGetNodesAndFilesError,
  zDiskGetRepoStatusError
]);

assertTypesEqual<
  ToDiskSeedProjectError,
  z.infer<typeof zToDiskSeedProjectError>
>({ value: true });
