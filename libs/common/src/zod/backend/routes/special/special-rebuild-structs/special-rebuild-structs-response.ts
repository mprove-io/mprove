import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type BridgeItem,
  zBridgeItem
} from '#common/zod/backend/special/bridge-item';
import {
  type ToBackendSpecialRebuildStructsError,
  zToBackendSpecialRebuildStructsError
} from './special-rebuild-structs-error';

export type ToBackendSpecialRebuildStructsOutput = {
  notFoundProjectIds: string[];
  successBridgeItems: BridgeItem[];
  successTotal: number;
  errorGetCatalogBridgeItems: BridgeItem[];
  errorTotal: number;
};

export type ToBackendSpecialRebuildStructsResponse = ToBackendResponse<
  ToBackendSpecialRebuildStructsOutput,
  ToBackendSpecialRebuildStructsError
>;

export let zToBackendSpecialRebuildStructsOutput = z
  .object({
    notFoundProjectIds: z.array(z.string()),
    successBridgeItems: z.array(zBridgeItem),
    successTotal: z.number(),
    errorGetCatalogBridgeItems: z.array(zBridgeItem),
    errorTotal: z.number()
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsOutput' });

export let zToBackendSpecialRebuildStructsResponse =
  makeToBackendResponseSchema({
    success: zToBackendSpecialRebuildStructsOutput,
    error: zToBackendSpecialRebuildStructsError
  }).meta({ id: 'ToBackendSpecialRebuildStructsResponse' });

assertTypesEqual<
  ToBackendSpecialRebuildStructsOutput,
  z.infer<typeof zToBackendSpecialRebuildStructsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSpecialRebuildStructsResponse,
  z.infer<typeof zToBackendSpecialRebuildStructsResponse>
>({ value: true });
