import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateProviderError,
  zToBackendCreateProviderError
} from './create-provider-error';

export type ToBackendCreateProviderOutput = {
  provider?: Provider;
};

export type ToBackendCreateProviderResponse = ToBackendResponse<
  ToBackendCreateProviderOutput,
  ToBackendCreateProviderError
>;

export let zToBackendCreateProviderOutput = z
  .object({
    provider: zProvider
  })
  .meta({ id: 'ToBackendCreateProviderOutput' });

export let zToBackendCreateProviderResponse = makeToBackendResponseSchema({
  success: zToBackendCreateProviderOutput,
  error: zToBackendCreateProviderError
}).meta({ id: 'ToBackendCreateProviderResponse' });

assertTypesEqual<
  ToBackendCreateProviderOutput,
  z.infer<typeof zToBackendCreateProviderOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateProviderResponse,
  z.infer<typeof zToBackendCreateProviderResponse>
>({ value: true });
