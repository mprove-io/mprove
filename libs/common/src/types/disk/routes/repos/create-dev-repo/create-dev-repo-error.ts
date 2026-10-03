import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskGetInitialCommitHashError,
  zDiskGetInitialCommitHashError
} from '#common/types/disk/function-errors/disk-get-initial-commit-hash-error';
import {
  type DiskGetNodesAndFilesError,
  zDiskGetNodesAndFilesError
} from '#common/types/disk/function-errors/disk-get-nodes-and-files-error';
import {
  type DiskGetRepoStatusError,
  zDiskGetRepoStatusError
} from '#common/types/disk/function-errors/disk-get-repo-status-error';

export type ToDiskCreateDevRepoError =
  | DiskGetInitialCommitHashError
  | DiskGetRepoStatusError
  | DiskGetNodesAndFilesError;

export let zToDiskCreateDevRepoError = z.union([
  zDiskGetInitialCommitHashError,
  zDiskGetRepoStatusError,
  zDiskGetNodesAndFilesError
]);

assertTypesEqual<
  ToDiskCreateDevRepoError,
  z.infer<typeof zToDiskCreateDevRepoError>
>({ value: true });
