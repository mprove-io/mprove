import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCheckLastNavOutput,
  zToBackendCheckLastNavOutput
} from '#common/types/backend/routes/nav/check-last-nav/check-last-nav-output';
import {
  type ToBackendCheckLastNavError,
  zToBackendCheckLastNavError
} from './check-last-nav-error';

export type ToBackendCheckLastNavResponse = ToBackendResponseBase<
  'checkLastNav',
  ToBackendCheckLastNavOutput,
  ToBackendCheckLastNavError
>;

export let zToBackendCheckLastNavResponse = makeToBackendResponseSchema({
  operation: 'checkLastNav',
  output: zToBackendCheckLastNavOutput,
  error: zToBackendCheckLastNavError
}).meta({ id: 'ToBackendCheckLastNavResponse' });

assertTypesEqual<
  ToBackendCheckLastNavResponse,
  z.infer<typeof zToBackendCheckLastNavResponse>
>({ value: true });
