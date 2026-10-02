import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSetProjectSandboxProviderOutput,
  zToBackendSetProjectSandboxProviderOutput
} from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-output';
import {
  type ToBackendSetProjectSandboxProviderError,
  zToBackendSetProjectSandboxProviderError
} from './set-project-sandbox-provider-error';

export type ToBackendSetProjectSandboxProviderResponse = ToBackendResponseBase<
  'setProjectSandboxProvider',
  ToBackendSetProjectSandboxProviderOutput,
  ToBackendSetProjectSandboxProviderError
>;

export let zToBackendSetProjectSandboxProviderResponse =
  makeToBackendResponseSchema({
    operation: 'setProjectSandboxProvider',
    output: zToBackendSetProjectSandboxProviderOutput,
    error: zToBackendSetProjectSandboxProviderError
  }).meta({ id: 'ToBackendSetProjectSandboxProviderResponse' });

assertTypesEqual<
  ToBackendSetProjectSandboxProviderResponse,
  z.infer<typeof zToBackendSetProjectSandboxProviderResponse>
>({ value: true });
