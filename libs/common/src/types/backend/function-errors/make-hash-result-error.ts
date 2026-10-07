import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';

export type MakeHashResultError = BackendHashSecretIsNotDefinedError;

export let zMakeHashResultError = zBackendHashSecretIsNotDefinedError;

assertTypesEqual<MakeHashResultError, z.infer<typeof zMakeHashResultError>>({
  value: true
});
