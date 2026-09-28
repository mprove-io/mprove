import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSetProjectAllowTimezonesOutput,
  zToBackendSetProjectAllowTimezonesOutput
} from '#common/zod/backend/routes/projects/set-project-allow-timezones/set-project-allow-timezones-output';
import {
  type ToBackendSetProjectAllowTimezonesError,
  zToBackendSetProjectAllowTimezonesError
} from './set-project-allow-timezones-error';

export type ToBackendSetProjectAllowTimezonesResponse = ToBackendResponseBase<
  'setProjectAllowTimezones',
  ToBackendSetProjectAllowTimezonesOutput,
  ToBackendSetProjectAllowTimezonesError
>;

export let zToBackendSetProjectAllowTimezonesResponse =
  makeToBackendResponseSchema({
    operation: 'setProjectAllowTimezones',
    output: zToBackendSetProjectAllowTimezonesOutput,
    error: zToBackendSetProjectAllowTimezonesError
  }).meta({ id: 'ToBackendSetProjectAllowTimezonesResponse' });

assertTypesEqual<
  ToBackendSetProjectAllowTimezonesResponse,
  z.infer<typeof zToBackendSetProjectAllowTimezonesResponse>
>({ value: true });
