import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/types/backend/errors/backend-unknown-sandbox-type-error';

export type StopSandboxError = BackendUnknownSandboxTypeError;

export let zStopSandboxError = zBackendUnknownSandboxTypeError;

assertTypesEqual<StopSandboxError, z.infer<typeof zStopSandboxError>>({
  value: true
});
