import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteProjectError,
  zToBackendDeleteProjectError
} from './delete-project-error';

export type ToBackendDeleteProjectOutput = Record<string, never>;

export type ToBackendDeleteProjectResponse = ToBackendResponse<
  ToBackendDeleteProjectOutput,
  ToBackendDeleteProjectError
>;

export let zToBackendDeleteProjectOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteProjectOutput' });

export let zToBackendDeleteProjectResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteProjectOutput,
  error: zToBackendDeleteProjectError
}).meta({ id: 'ToBackendDeleteProjectResponse' });

assertTypesEqual<
  ToBackendDeleteProjectOutput,
  z.infer<typeof zToBackendDeleteProjectOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteProjectResponse,
  z.infer<typeof zToBackendDeleteProjectResponse>
>({ value: true });
