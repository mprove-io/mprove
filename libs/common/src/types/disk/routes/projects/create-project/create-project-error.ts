import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCheckProjectDoesNotExistError,
  zDiskCheckProjectDoesNotExistError
} from '#common/types/disk/function-errors/disk-check-project-does-not-exist-error';
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

export type ToDiskCreateProjectError =
  | DiskCheckProjectDoesNotExistError
  | DiskPrepareRemoteAndProdError
  | DiskGetNodesAndFilesError
  | DiskGetRepoStatusError;

export let zToDiskCreateProjectError = z.union([
  zDiskCheckProjectDoesNotExistError,
  zDiskPrepareRemoteAndProdError,
  zDiskGetNodesAndFilesError,
  zDiskGetRepoStatusError
]);

assertTypesEqual<
  ToDiskCreateProjectError,
  z.infer<typeof zToDiskCreateProjectError>
>({ value: true });
