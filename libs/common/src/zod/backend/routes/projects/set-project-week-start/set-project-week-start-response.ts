import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/zod/backend/project';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetProjectWeekStartError,
  zToBackendSetProjectWeekStartError
} from './set-project-week-start-error';

export type ToBackendSetProjectWeekStartOutput = {
  project: Project;
};

export type ToBackendSetProjectWeekStartResponse = ToBackendResponse<
  ToBackendSetProjectWeekStartOutput,
  ToBackendSetProjectWeekStartError
>;

export let zToBackendSetProjectWeekStartOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectWeekStartOutput' });

export let zToBackendSetProjectWeekStartResponse = makeToBackendResponseSchema({
  success: zToBackendSetProjectWeekStartOutput,
  error: zToBackendSetProjectWeekStartError
}).meta({ id: 'ToBackendSetProjectWeekStartResponse' });

assertTypesEqual<
  ToBackendSetProjectWeekStartOutput,
  z.infer<typeof zToBackendSetProjectWeekStartOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectWeekStartResponse,
  z.infer<typeof zToBackendSetProjectWeekStartResponse>
>({ value: true });
