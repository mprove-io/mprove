import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/zod/backend/project';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetProjectTimezoneError,
  zToBackendSetProjectTimezoneError
} from './set-project-timezone-error';

export type ToBackendSetProjectTimezoneOutput = {
  project: Project;
};

export type ToBackendSetProjectTimezoneResponse = ToBackendResponse<
  ToBackendSetProjectTimezoneOutput,
  ToBackendSetProjectTimezoneError
>;

export let zToBackendSetProjectTimezoneOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectTimezoneOutput' });

export let zToBackendSetProjectTimezoneResponse = makeToBackendResponseSchema({
  success: zToBackendSetProjectTimezoneOutput,
  error: zToBackendSetProjectTimezoneError
}).meta({ id: 'ToBackendSetProjectTimezoneResponse' });

assertTypesEqual<
  ToBackendSetProjectTimezoneOutput,
  z.infer<typeof zToBackendSetProjectTimezoneOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectTimezoneResponse,
  z.infer<typeof zToBackendSetProjectTimezoneResponse>
>({ value: true });
