import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSandboxHealthCheckFailedError,
  zBackendSandboxHealthCheckFailedError
} from '#common/types/backend/errors/backend-sandbox-health-check-failed-error';

export type HealthCheckOpenCodeError = BackendSandboxHealthCheckFailedError;

export let zHealthCheckOpenCodeError = zBackendSandboxHealthCheckFailedError;

assertTypesEqual<
  HealthCheckOpenCodeError,
  z.infer<typeof zHealthCheckOpenCodeError>
>({ value: true });
