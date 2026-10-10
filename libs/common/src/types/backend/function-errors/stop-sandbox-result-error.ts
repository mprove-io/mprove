import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/types/backend/errors/backend-unknown-sandbox-type-error';

export type StopSandboxResultError = BackendUnknownSandboxTypeError;

export let zStopSandboxResultError = zBackendUnknownSandboxTypeError;

assertTypesEqual<
  StopSandboxResultError,
  z.infer<typeof zStopSandboxResultError>
>({
  value: true
});
