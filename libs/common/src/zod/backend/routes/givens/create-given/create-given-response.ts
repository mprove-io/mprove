import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateGivenOutput,
  zToBackendCreateGivenOutput
} from '#common/zod/backend/routes/givens/create-given/create-given-output';
import {
  type ToBackendCreateGivenError,
  zToBackendCreateGivenError
} from './create-given-error';

export type ToBackendCreateGivenResponse = ToBackendResponseBase<
  'createGiven',
  ToBackendCreateGivenOutput,
  ToBackendCreateGivenError
>;

export let zToBackendCreateGivenResponse = makeToBackendResponseSchema({
  operation: 'createGiven',
  output: zToBackendCreateGivenOutput,
  error: zToBackendCreateGivenError
}).meta({ id: 'ToBackendCreateGivenResponse' });

assertTypesEqual<
  ToBackendCreateGivenResponse,
  z.infer<typeof zToBackendCreateGivenResponse>
>({ value: true });
