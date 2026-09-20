import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCheckoutRequestedBranchError,
  zDiskCheckoutRequestedBranchError
} from '#common/zod/disk/function-errors/disk-checkout-requested-branch-error';

export type ToDiskGetCatalogNodesError = DiskCheckoutRequestedBranchError;

export let zToDiskGetCatalogNodesError = zDiskCheckoutRequestedBranchError;

assertTypesEqual<
  ToDiskGetCatalogNodesError,
  z.infer<typeof zToDiskGetCatalogNodesError>
>({ value: true });
