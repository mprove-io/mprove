import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/zod/backend/project';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetProjectSandboxProviderError,
  zToBackendSetProjectSandboxProviderError
} from './set-project-sandbox-provider-error';

export type ToBackendSetProjectSandboxProviderOutput = {
  project: Project;
};

export type ToBackendSetProjectSandboxProviderResponse = ToBackendResponse<
  ToBackendSetProjectSandboxProviderOutput,
  ToBackendSetProjectSandboxProviderError
>;

export let zToBackendSetProjectSandboxProviderOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderOutput' });

export let zToBackendSetProjectSandboxProviderResponse =
  makeToBackendResponseSchema({
    success: zToBackendSetProjectSandboxProviderOutput,
    error: zToBackendSetProjectSandboxProviderError
  }).meta({ id: 'ToBackendSetProjectSandboxProviderResponse' });

assertTypesEqual<
  ToBackendSetProjectSandboxProviderOutput,
  z.infer<typeof zToBackendSetProjectSandboxProviderOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectSandboxProviderResponse,
  z.infer<typeof zToBackendSetProjectSandboxProviderResponse>
>({ value: true });
