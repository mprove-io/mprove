import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendEditProviderOutput,
  zToBackendEditProviderOutput
} from '#common/types/backend/routes/providers/edit-provider/edit-provider-output';
import {
  type ToBackendEditProviderError,
  zToBackendEditProviderError
} from './edit-provider-error';

export type ToBackendEditProviderResponse = ToBackendResponseBase<
  'editProvider',
  ToBackendEditProviderOutput,
  ToBackendEditProviderError
>;

export let zToBackendEditProviderResponse = makeToBackendResponseSchema({
  operation: 'editProvider',
  output: zToBackendEditProviderOutput,
  error: zToBackendEditProviderError
}).meta({ id: 'ToBackendEditProviderResponse' });

assertTypesEqual<
  ToBackendEditProviderResponse,
  z.infer<typeof zToBackendEditProviderResponse>
>({ value: true });
