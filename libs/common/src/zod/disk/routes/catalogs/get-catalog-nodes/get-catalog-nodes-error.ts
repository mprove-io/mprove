import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskGetIsFetchedAfterCheckoutRequestedBranchError,
  zDiskGetIsFetchedAfterCheckoutRequestedBranchError
} from '#common/zod/disk/function-errors/disk-get-is-fetched-after-checkout-requested-branch-error';

export type ToDiskGetCatalogNodesError =
  DiskGetIsFetchedAfterCheckoutRequestedBranchError;

export let zToDiskGetCatalogNodesError =
  zDiskGetIsFetchedAfterCheckoutRequestedBranchError;

assertTypesEqual<
  ToDiskGetCatalogNodesError,
  z.infer<typeof zToDiskGetCatalogNodesError>
>({ value: true });
