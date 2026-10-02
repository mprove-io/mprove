import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BridgeItem,
  zBridgeItem
} from '#common/types/backend/parts/special/bridge-item';

export type ToBackendSpecialRebuildStructsOutput = {
  notFoundProjectIds: string[];
  successBridgeItems: BridgeItem[];
  successTotal: number;
  errorGetCatalogBridgeItems: BridgeItem[];
  errorTotal: number;
};

export let zToBackendSpecialRebuildStructsOutput = z
  .object({
    notFoundProjectIds: z.array(z.string()),
    successBridgeItems: z.array(zBridgeItem),
    successTotal: z.number(),
    errorGetCatalogBridgeItems: z.array(zBridgeItem),
    errorTotal: z.number()
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsOutput' });

assertTypesEqual<
  ToBackendSpecialRebuildStructsOutput,
  z.infer<typeof zToBackendSpecialRebuildStructsOutput>
>({ value: true });
