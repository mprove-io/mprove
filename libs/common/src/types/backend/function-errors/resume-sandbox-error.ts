import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/types/backend/errors/backend-unknown-sandbox-type-error';

export type ResumeSandboxError = BackendUnknownSandboxTypeError;

export let zResumeSandboxError = zBackendUnknownSandboxTypeError;

assertTypesEqual<ResumeSandboxError, z.infer<typeof zResumeSandboxError>>({
  value: true
});
