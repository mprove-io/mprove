import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetModelsOutput,
  zToBackendGetModelsOutput
} from '#common/types/backend/routes/models/get-models/get-models-output';
import {
  type ToBackendGetModelsError,
  zToBackendGetModelsError
} from './get-models-error';

export type ToBackendGetModelsResponse = ToBackendResponseBase<
  'getModels',
  ToBackendGetModelsOutput,
  ToBackendGetModelsError
>;

export let zToBackendGetModelsResponse = makeToBackendResponseSchema({
  operation: 'getModels',
  output: zToBackendGetModelsOutput,
  error: zToBackendGetModelsError
}).meta({ id: 'ToBackendGetModelsResponse' });

assertTypesEqual<
  ToBackendGetModelsResponse,
  z.infer<typeof zToBackendGetModelsResponse>
>({ value: true });
