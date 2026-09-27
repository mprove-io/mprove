import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendEditProviderError,
  zToBackendEditProviderError
} from './edit-provider-error';

export type ToBackendEditProviderOutput = {
  provider?: Provider;
};

export type ToBackendEditProviderResponse = ToBackendResponse<
  ToBackendEditProviderOutput,
  ToBackendEditProviderError
>;

export let zToBackendEditProviderOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendEditProviderOutput' });

export let zToBackendEditProviderResponse = makeToBackendResponseSchema({
  success: zToBackendEditProviderOutput,
  error: zToBackendEditProviderError
}).meta({ id: 'ToBackendEditProviderResponse' });

assertTypesEqual<
  ToBackendEditProviderOutput,
  z.infer<typeof zToBackendEditProviderOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditProviderResponse,
  z.infer<typeof zToBackendEditProviderResponse>
>({ value: true });
