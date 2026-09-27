import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendToggleProviderError,
  zToBackendToggleProviderError
} from './toggle-provider-error';

export type ToBackendToggleProviderOutput = {
  provider?: Provider;
};

export type ToBackendToggleProviderResponse = ToBackendResponse<
  ToBackendToggleProviderOutput,
  ToBackendToggleProviderError
>;

export let zToBackendToggleProviderOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendToggleProviderOutput' });

export let zToBackendToggleProviderResponse = makeToBackendResponseSchema({
  success: zToBackendToggleProviderOutput,
  error: zToBackendToggleProviderError
}).meta({ id: 'ToBackendToggleProviderResponse' });

assertTypesEqual<
  ToBackendToggleProviderOutput,
  z.infer<typeof zToBackendToggleProviderOutput>
>({ value: true });

assertTypesEqual<
  ToBackendToggleProviderResponse,
  z.infer<typeof zToBackendToggleProviderResponse>
>({ value: true });
