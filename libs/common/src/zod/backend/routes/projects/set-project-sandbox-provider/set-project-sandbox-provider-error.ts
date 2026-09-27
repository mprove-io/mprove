import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSetProjectSandboxProviderError = BackendError;

export let zToBackendSetProjectSandboxProviderError = zBackendError;

assertTypesEqual<
  ToBackendSetProjectSandboxProviderError,
  z.infer<typeof zToBackendSetProjectSandboxProviderError>
>({ value: true });
