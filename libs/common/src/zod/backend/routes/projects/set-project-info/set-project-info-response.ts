import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/zod/backend/project';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetProjectInfoError,
  zToBackendSetProjectInfoError
} from './set-project-info-error';

export type ToBackendSetProjectInfoOutput = {
  project: Project;
};

export type ToBackendSetProjectInfoResponse = ToBackendResponse<
  ToBackendSetProjectInfoOutput,
  ToBackendSetProjectInfoError
>;

export let zToBackendSetProjectInfoOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectInfoOutput' });

export let zToBackendSetProjectInfoResponse = makeToBackendResponseSchema({
  success: zToBackendSetProjectInfoOutput,
  error: zToBackendSetProjectInfoError
}).meta({ id: 'ToBackendSetProjectInfoResponse' });

assertTypesEqual<
  ToBackendSetProjectInfoOutput,
  z.infer<typeof zToBackendSetProjectInfoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectInfoResponse,
  z.infer<typeof zToBackendSetProjectInfoResponse>
>({ value: true });
