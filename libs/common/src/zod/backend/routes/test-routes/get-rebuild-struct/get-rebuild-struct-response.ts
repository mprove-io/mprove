import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBlockmlRebuildStructOutput,
  zToBlockmlRebuildStructOutput
} from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-output';
import {
  type ToBackendGetRebuildStructError,
  zToBackendGetRebuildStructError
} from './get-rebuild-struct-error';

export type ToBackendGetRebuildStructOutput = ToBlockmlRebuildStructOutput;

export type ToBackendGetRebuildStructResponse = ToBackendResponse<
  ToBackendGetRebuildStructOutput,
  ToBackendGetRebuildStructError
>;

export let zToBackendGetRebuildStructOutput = zToBlockmlRebuildStructOutput;

export let zToBackendGetRebuildStructResponse = makeToBackendResponseSchema({
  success: zToBackendGetRebuildStructOutput,
  error: zToBackendGetRebuildStructError
}).meta({ id: 'ToBackendGetRebuildStructResponse' });

assertTypesEqual<
  ToBackendGetRebuildStructOutput,
  z.infer<typeof zToBackendGetRebuildStructOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetRebuildStructResponse,
  z.infer<typeof zToBackendGetRebuildStructResponse>
>({ value: true });
