import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendToggleProviderOutput,
  zToBackendToggleProviderOutput
} from '#common/zod/backend/routes/providers/toggle-provider/toggle-provider-output';
import {
  type ToBackendToggleProviderError,
  zToBackendToggleProviderError
} from './toggle-provider-error';

export type ToBackendToggleProviderResponse = ToBackendResponseBase<
  'toggleProvider',
  ToBackendToggleProviderOutput,
  ToBackendToggleProviderError
>;

export let zToBackendToggleProviderResponse = makeToBackendResponseSchema({
  operation: 'toggleProvider',
  output: zToBackendToggleProviderOutput,
  error: zToBackendToggleProviderError
}).meta({ id: 'ToBackendToggleProviderResponse' });

assertTypesEqual<
  ToBackendToggleProviderResponse,
  z.infer<typeof zToBackendToggleProviderResponse>
>({ value: true });
