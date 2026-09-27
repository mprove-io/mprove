import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteProviderError,
  zToBackendDeleteProviderError
} from './delete-provider-error';

export type ToBackendDeleteProviderOutput = Record<string, never>;

export type ToBackendDeleteProviderResponse = ToBackendResponse<
  ToBackendDeleteProviderOutput,
  ToBackendDeleteProviderError
>;

export let zToBackendDeleteProviderOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteProviderOutput' });

export let zToBackendDeleteProviderResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteProviderOutput,
  error: zToBackendDeleteProviderError
}).meta({ id: 'ToBackendDeleteProviderResponse' });

assertTypesEqual<
  ToBackendDeleteProviderOutput,
  z.infer<typeof zToBackendDeleteProviderOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteProviderResponse,
  z.infer<typeof zToBackendDeleteProviderResponse>
>({ value: true });
