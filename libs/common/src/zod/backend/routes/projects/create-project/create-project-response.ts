import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/zod/backend/project';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateProjectError,
  zToBackendCreateProjectError
} from './create-project-error';

export type ToBackendCreateProjectOutput = {
  project: Project;
};

export type ToBackendCreateProjectResponse = ToBackendResponse<
  ToBackendCreateProjectOutput,
  ToBackendCreateProjectError
>;

export let zToBackendCreateProjectOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendCreateProjectOutput' });

export let zToBackendCreateProjectResponse = makeToBackendResponseSchema({
  success: zToBackendCreateProjectOutput,
  error: zToBackendCreateProjectError
}).meta({ id: 'ToBackendCreateProjectResponse' });

assertTypesEqual<
  ToBackendCreateProjectOutput,
  z.infer<typeof zToBackendCreateProjectOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateProjectResponse,
  z.infer<typeof zToBackendCreateProjectResponse>
>({ value: true });
