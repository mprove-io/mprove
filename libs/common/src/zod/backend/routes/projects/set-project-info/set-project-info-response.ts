import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSetProjectInfoOutput,
  zToBackendSetProjectInfoOutput
} from '#common/zod/backend/routes/projects/set-project-info/set-project-info-output';
import {
  type ToBackendSetProjectInfoError,
  zToBackendSetProjectInfoError
} from './set-project-info-error';

export type ToBackendSetProjectInfoResponse = ToBackendResponseBase<
  'setProjectInfo',
  ToBackendSetProjectInfoOutput,
  ToBackendSetProjectInfoError
>;

export let zToBackendSetProjectInfoResponse = makeToBackendResponseSchema({
  operation: 'setProjectInfo',
  output: zToBackendSetProjectInfoOutput,
  error: zToBackendSetProjectInfoError
}).meta({ id: 'ToBackendSetProjectInfoResponse' });

assertTypesEqual<
  ToBackendSetProjectInfoResponse,
  z.infer<typeof zToBackendSetProjectInfoResponse>
>({ value: true });
