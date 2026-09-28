import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetProvidersOutput,
  zToBackendGetProvidersOutput
} from '#common/zod/backend/routes/providers/get-providers/get-providers-output';
import {
  type ToBackendGetProvidersError,
  zToBackendGetProvidersError
} from './get-providers-error';

export type ToBackendGetProvidersResponse = ToBackendResponseBase<
  'getProviders',
  ToBackendGetProvidersOutput,
  ToBackendGetProvidersError
>;

export let zToBackendGetProvidersResponse = makeToBackendResponseSchema({
  operation: 'getProviders',
  output: zToBackendGetProvidersOutput,
  error: zToBackendGetProvidersError
}).meta({ id: 'ToBackendGetProvidersResponse' });

assertTypesEqual<
  ToBackendGetProvidersResponse,
  z.infer<typeof zToBackendGetProvidersResponse>
>({ value: true });
