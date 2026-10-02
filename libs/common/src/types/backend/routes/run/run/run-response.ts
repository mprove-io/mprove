import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendRunOutput,
  zToBackendRunOutput
} from '#common/types/backend/routes/run/run/run-output';
import { type ToBackendRunError, zToBackendRunError } from './run-error';

export type ToBackendRunResponse = ToBackendResponseBase<
  'run',
  ToBackendRunOutput,
  ToBackendRunError
>;

export let zToBackendRunResponse = makeToBackendResponseSchema({
  operation: 'run',
  output: zToBackendRunOutput,
  error: zToBackendRunError
}).meta({ id: 'ToBackendRunResponse' });

assertTypesEqual<ToBackendRunResponse, z.infer<typeof zToBackendRunResponse>>({
  value: true
});
