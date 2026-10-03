import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCheckRestoreOrgProjectRepoBranchError,
  zDiskCheckRestoreOrgProjectRepoBranchError
} from '#common/types/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import {
  type DiskGetEffectiveIsFetchError,
  zDiskGetEffectiveIsFetchError
} from '#common/types/disk/function-errors/disk-get-effective-is-fetch-error';
import {
  type DiskGetIsFetchedAfterCheckoutRequestedBranchError,
  zDiskGetIsFetchedAfterCheckoutRequestedBranchError
} from '#common/types/disk/function-errors/disk-get-is-fetched-after-checkout-requested-branch-error';
import {
  type DiskGetNodesAndFilesError,
  zDiskGetNodesAndFilesError
} from '#common/types/disk/function-errors/disk-get-nodes-and-files-error';
import {
  type DiskGetRepoStatusError,
  zDiskGetRepoStatusError
} from '#common/types/disk/function-errors/disk-get-repo-status-error';

export type ToDiskGetCatalogNodesError =
  | DiskCheckRestoreOrgProjectRepoBranchError
  | DiskGetEffectiveIsFetchError
  | DiskGetIsFetchedAfterCheckoutRequestedBranchError
  | DiskGetNodesAndFilesError
  | DiskGetRepoStatusError;

export let zToDiskGetCatalogNodesError = z.union([
  zDiskCheckRestoreOrgProjectRepoBranchError,
  zDiskGetEffectiveIsFetchError,
  zDiskGetIsFetchedAfterCheckoutRequestedBranchError,
  zDiskGetNodesAndFilesError,
  zDiskGetRepoStatusError
]);

assertTypesEqual<
  ToDiskGetCatalogNodesError,
  z.infer<typeof zToDiskGetCatalogNodesError>
>({ value: true });
