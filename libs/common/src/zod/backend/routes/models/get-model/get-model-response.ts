import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetModelOutput,
  zToBackendGetModelOutput
} from '#common/zod/backend/routes/models/get-model/get-model-output';
import {
  type ToBackendGetModelError,
  zToBackendGetModelError
} from './get-model-error';

export type ToBackendGetModelResponse = ToBackendResponseBase<
  'getModel',
  ToBackendGetModelOutput,
  ToBackendGetModelError
>;

export let zToBackendGetModelResponse = makeToBackendResponseSchema({
  operation: 'getModel',
  output: zToBackendGetModelOutput,
  error: zToBackendGetModelError
}).meta({ id: 'ToBackendGetModelResponse' });

assertTypesEqual<
  ToBackendGetModelResponse,
  z.infer<typeof zToBackendGetModelResponse>
>({ value: true });
