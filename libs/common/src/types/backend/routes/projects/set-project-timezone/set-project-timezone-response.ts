import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSetProjectTimezoneOutput,
  zToBackendSetProjectTimezoneOutput
} from '#common/types/backend/routes/projects/set-project-timezone/set-project-timezone-output';
import {
  type ToBackendSetProjectTimezoneError,
  zToBackendSetProjectTimezoneError
} from './set-project-timezone-error';

export type ToBackendSetProjectTimezoneResponse = ToBackendResponseBase<
  'setProjectTimezone',
  ToBackendSetProjectTimezoneOutput,
  ToBackendSetProjectTimezoneError
>;

export let zToBackendSetProjectTimezoneResponse = makeToBackendResponseSchema({
  operation: 'setProjectTimezone',
  output: zToBackendSetProjectTimezoneOutput,
  error: zToBackendSetProjectTimezoneError
}).meta({ id: 'ToBackendSetProjectTimezoneResponse' });

assertTypesEqual<
  ToBackendSetProjectTimezoneResponse,
  z.infer<typeof zToBackendSetProjectTimezoneResponse>
>({ value: true });
