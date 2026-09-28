import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateProviderOutput,
  zToBackendCreateProviderOutput
} from '#common/zod/backend/routes/providers/create-provider/create-provider-output';
import {
  type ToBackendCreateProviderError,
  zToBackendCreateProviderError
} from './create-provider-error';

export type ToBackendCreateProviderResponse = ToBackendResponseBase<
  'createProvider',
  ToBackendCreateProviderOutput,
  ToBackendCreateProviderError
>;

export let zToBackendCreateProviderResponse = makeToBackendResponseSchema({
  operation: 'createProvider',
  output: zToBackendCreateProviderOutput,
  error: zToBackendCreateProviderError
}).meta({ id: 'ToBackendCreateProviderResponse' });

assertTypesEqual<
  ToBackendCreateProviderResponse,
  z.infer<typeof zToBackendCreateProviderResponse>
>({ value: true });
