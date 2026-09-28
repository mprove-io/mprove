import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendRunQueriesDryOutput,
  zToBackendRunQueriesDryOutput
} from '#common/zod/backend/routes/queries/run-queries-dry/run-queries-dry-output';
import {
  type ToBackendRunQueriesDryError,
  zToBackendRunQueriesDryError
} from './run-queries-dry-error';

export type ToBackendRunQueriesDryResponse = ToBackendResponseBase<
  'runQueriesDry',
  ToBackendRunQueriesDryOutput,
  ToBackendRunQueriesDryError
>;

export let zToBackendRunQueriesDryResponse = makeToBackendResponseSchema({
  operation: 'runQueriesDry',
  output: zToBackendRunQueriesDryOutput,
  error: zToBackendRunQueriesDryError
}).meta({ id: 'ToBackendRunQueriesDryResponse' });

assertTypesEqual<
  ToBackendRunQueriesDryResponse,
  z.infer<typeof zToBackendRunQueriesDryResponse>
>({ value: true });
