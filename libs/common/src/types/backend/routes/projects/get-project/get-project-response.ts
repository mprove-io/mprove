import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetProjectOutput,
  zToBackendGetProjectOutput
} from '#common/types/backend/routes/projects/get-project/get-project-output';
import {
  type ToBackendGetProjectError,
  zToBackendGetProjectError
} from './get-project-error';

export type ToBackendGetProjectResponse = ToBackendResponseBase<
  'getProject',
  ToBackendGetProjectOutput,
  ToBackendGetProjectError
>;

export let zToBackendGetProjectResponse = makeToBackendResponseSchema({
  operation: 'getProject',
  output: zToBackendGetProjectOutput,
  error: zToBackendGetProjectError
}).meta({ id: 'ToBackendGetProjectResponse' });

assertTypesEqual<
  ToBackendGetProjectResponse,
  z.infer<typeof zToBackendGetProjectResponse>
>({ value: true });
