import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteProjectOutput,
  zToBackendDeleteProjectOutput
} from '#common/zod/backend/routes/projects/delete-project/delete-project-output';
import {
  type ToBackendDeleteProjectError,
  zToBackendDeleteProjectError
} from './delete-project-error';

export type ToBackendDeleteProjectResponse = ToBackendResponseBase<
  'deleteProject',
  ToBackendDeleteProjectOutput,
  ToBackendDeleteProjectError
>;

export let zToBackendDeleteProjectResponse = makeToBackendResponseSchema({
  operation: 'deleteProject',
  output: zToBackendDeleteProjectOutput,
  error: zToBackendDeleteProjectError
}).meta({ id: 'ToBackendDeleteProjectResponse' });

assertTypesEqual<
  ToBackendDeleteProjectResponse,
  z.infer<typeof zToBackendDeleteProjectResponse>
>({ value: true });
