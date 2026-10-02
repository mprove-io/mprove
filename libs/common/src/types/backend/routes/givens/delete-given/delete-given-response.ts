import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteGivenOutput,
  zToBackendDeleteGivenOutput
} from '#common/types/backend/routes/givens/delete-given/delete-given-output';
import {
  type ToBackendDeleteGivenError,
  zToBackendDeleteGivenError
} from './delete-given-error';

export type ToBackendDeleteGivenResponse = ToBackendResponseBase<
  'deleteGiven',
  ToBackendDeleteGivenOutput,
  ToBackendDeleteGivenError
>;

export let zToBackendDeleteGivenResponse = makeToBackendResponseSchema({
  operation: 'deleteGiven',
  output: zToBackendDeleteGivenOutput,
  error: zToBackendDeleteGivenError
}).meta({ id: 'ToBackendDeleteGivenResponse' });

assertTypesEqual<
  ToBackendDeleteGivenResponse,
  z.infer<typeof zToBackendDeleteGivenResponse>
>({ value: true });
