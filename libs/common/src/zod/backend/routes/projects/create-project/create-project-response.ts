import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateProjectOutput,
  zToBackendCreateProjectOutput
} from '#common/zod/backend/routes/projects/create-project/create-project-output';
import {
  type ToBackendCreateProjectError,
  zToBackendCreateProjectError
} from './create-project-error';

export type ToBackendCreateProjectResponse = ToBackendResponseBase<
  'createProject',
  ToBackendCreateProjectOutput,
  ToBackendCreateProjectError
>;

export let zToBackendCreateProjectResponse = makeToBackendResponseSchema({
  operation: 'createProject',
  output: zToBackendCreateProjectOutput,
  error: zToBackendCreateProjectError
}).meta({ id: 'ToBackendCreateProjectResponse' });

assertTypesEqual<
  ToBackendCreateProjectResponse,
  z.infer<typeof zToBackendCreateProjectResponse>
>({ value: true });
