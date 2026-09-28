import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendEditGivenOutput,
  zToBackendEditGivenOutput
} from '#common/zod/backend/routes/givens/edit-given/edit-given-output';
import {
  type ToBackendEditGivenError,
  zToBackendEditGivenError
} from './edit-given-error';

export type ToBackendEditGivenResponse = ToBackendResponseBase<
  'editGiven',
  ToBackendEditGivenOutput,
  ToBackendEditGivenError
>;

export let zToBackendEditGivenResponse = makeToBackendResponseSchema({
  operation: 'editGiven',
  output: zToBackendEditGivenOutput,
  error: zToBackendEditGivenError
}).meta({ id: 'ToBackendEditGivenResponse' });

assertTypesEqual<
  ToBackendEditGivenResponse,
  z.infer<typeof zToBackendEditGivenResponse>
>({ value: true });
