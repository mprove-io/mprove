import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteProviderOutput,
  zToBackendDeleteProviderOutput
} from '#common/types/backend/routes/providers/delete-provider/delete-provider-output';
import {
  type ToBackendDeleteProviderError,
  zToBackendDeleteProviderError
} from './delete-provider-error';

export type ToBackendDeleteProviderResponse = ToBackendResponseBase<
  'deleteProvider',
  ToBackendDeleteProviderOutput,
  ToBackendDeleteProviderError
>;

export let zToBackendDeleteProviderResponse = makeToBackendResponseSchema({
  operation: 'deleteProvider',
  output: zToBackendDeleteProviderOutput,
  error: zToBackendDeleteProviderError
}).meta({ id: 'ToBackendDeleteProviderResponse' });

assertTypesEqual<
  ToBackendDeleteProviderResponse,
  z.infer<typeof zToBackendDeleteProviderResponse>
>({ value: true });
