import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendSignUpToSetPasswordError,
  zBackendSignUpToSetPasswordError
} from '#common/zod/backend/errors/backend-sign-up-to-set-password-error';
import {
  type BackendWrongPasswordError,
  zBackendWrongPasswordError
} from '#common/zod/backend/errors/backend-wrong-password-error';

export type ToBackendLoginUserError =
  | BackendHashSecretIsNotDefinedError
  | BackendSignUpToSetPasswordError
  | BackendWrongPasswordError;

export let zToBackendLoginUserError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendSignUpToSetPasswordError,
  zBackendWrongPasswordError
]);

assertTypesEqual<
  ToBackendLoginUserError,
  z.infer<typeof zToBackendLoginUserError>
>({ value: true });
