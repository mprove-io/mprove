import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetGivensOutput,
  zToBackendGetGivensOutput
} from '#common/types/backend/routes/givens/get-givens/get-givens-output';
import {
  type ToBackendGetGivensError,
  zToBackendGetGivensError
} from './get-givens-error';

export type ToBackendGetGivensResponse = ToBackendResponseBase<
  'getGivens',
  ToBackendGetGivensOutput,
  ToBackendGetGivensError
>;

export let zToBackendGetGivensResponse = makeToBackendResponseSchema({
  operation: 'getGivens',
  output: zToBackendGetGivensOutput,
  error: zToBackendGetGivensError
}).meta({ id: 'ToBackendGetGivensResponse' });

assertTypesEqual<
  ToBackendGetGivensResponse,
  z.infer<typeof zToBackendGetGivensResponse>
>({ value: true });
