import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetNavOutput,
  zToBackendGetNavOutput
} from '#common/types/backend/routes/nav/get-nav/get-nav-output';
import {
  type ToBackendGetNavError,
  zToBackendGetNavError
} from './get-nav-error';

export type ToBackendGetNavResponse = ToBackendResponseBase<
  'getNav',
  ToBackendGetNavOutput,
  ToBackendGetNavError
>;

export let zToBackendGetNavResponse = makeToBackendResponseSchema({
  operation: 'getNav',
  output: zToBackendGetNavOutput,
  error: zToBackendGetNavError
}).meta({ id: 'ToBackendGetNavResponse' });

assertTypesEqual<
  ToBackendGetNavResponse,
  z.infer<typeof zToBackendGetNavResponse>
>({ value: true });
