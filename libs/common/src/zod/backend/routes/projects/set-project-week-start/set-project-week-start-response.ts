import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSetProjectWeekStartOutput,
  zToBackendSetProjectWeekStartOutput
} from '#common/zod/backend/routes/projects/set-project-week-start/set-project-week-start-output';
import {
  type ToBackendSetProjectWeekStartError,
  zToBackendSetProjectWeekStartError
} from './set-project-week-start-error';

export type ToBackendSetProjectWeekStartResponse = ToBackendResponseBase<
  'setProjectWeekStart',
  ToBackendSetProjectWeekStartOutput,
  ToBackendSetProjectWeekStartError
>;

export let zToBackendSetProjectWeekStartResponse = makeToBackendResponseSchema({
  operation: 'setProjectWeekStart',
  output: zToBackendSetProjectWeekStartOutput,
  error: zToBackendSetProjectWeekStartError
}).meta({ id: 'ToBackendSetProjectWeekStartResponse' });

assertTypesEqual<
  ToBackendSetProjectWeekStartResponse,
  z.infer<typeof zToBackendSetProjectWeekStartResponse>
>({ value: true });
