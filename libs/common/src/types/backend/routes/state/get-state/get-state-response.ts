import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetStateOutput,
  zToBackendGetStateOutput
} from '#common/types/backend/routes/state/get-state/get-state-output';
import {
  type ToBackendGetStateError,
  zToBackendGetStateError
} from './get-state-error';

export type ToBackendGetStateResponse = ToBackendResponseBase<
  'getState',
  ToBackendGetStateOutput,
  ToBackendGetStateError
>;

export let zToBackendGetStateResponse = makeToBackendResponseSchema({
  operation: 'getState',
  output: zToBackendGetStateOutput,
  error: zToBackendGetStateError
}).meta({ id: 'ToBackendGetStateResponse' });

assertTypesEqual<
  ToBackendGetStateResponse,
  z.infer<typeof zToBackendGetStateResponse>
>({ value: true });
