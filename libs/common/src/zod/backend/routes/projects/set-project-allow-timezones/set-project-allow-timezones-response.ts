import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/zod/backend/project';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetProjectAllowTimezonesError,
  zToBackendSetProjectAllowTimezonesError
} from './set-project-allow-timezones-error';

export type ToBackendSetProjectAllowTimezonesOutput = {
  project: Project;
};

export type ToBackendSetProjectAllowTimezonesResponse = ToBackendResponse<
  ToBackendSetProjectAllowTimezonesOutput,
  ToBackendSetProjectAllowTimezonesError
>;

export let zToBackendSetProjectAllowTimezonesOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesOutput' });

export let zToBackendSetProjectAllowTimezonesResponse =
  makeToBackendResponseSchema({
    success: zToBackendSetProjectAllowTimezonesOutput,
    error: zToBackendSetProjectAllowTimezonesError
  }).meta({ id: 'ToBackendSetProjectAllowTimezonesResponse' });

assertTypesEqual<
  ToBackendSetProjectAllowTimezonesOutput,
  z.infer<typeof zToBackendSetProjectAllowTimezonesOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectAllowTimezonesResponse,
  z.infer<typeof zToBackendSetProjectAllowTimezonesResponse>
>({ value: true });
